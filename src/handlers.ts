import { IncomingMessage, ClientRequest } from 'node:http';
import https from 'node:https';
import http from 'node:http';
import { join, resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import type { EdgioProxyTransformConfig } from './config.js';
import { compress, decompress } from './utils/compression.js';
import { ConfigLoader } from './config.js';

// Handler instance cache by name
const handlerInstanceCache: Map<string, BaseHandlerImpl> = new Map();

type OriginConfig = {
	scheme: string;
	hostname: string;
	port: number;
	overrideHostHeader: string;
};

type BaseHandler = {
	handleRequest: (request: ClientRequest, response: IncomingMessage) => Promise<void>;
};

type ProxyHandler = {
	transformRequest?: (request: any) => void;
	transformResponse?: (response: any, request: any, rawBody: any) => void;
};

class BaseHandlerImpl implements BaseHandler {
	protected _handlerName: string;
	protected _handler: any;
	protected _always: boolean;

	constructor(name: string, handler: any, always: boolean = false) {
		this._handlerName = name;
		this._handler = handler;
		this._always = always;
	}

	async handleRequest(request: ClientRequest, response: IncomingMessage) {
		throw new Error('Not implemented');
	}

	get handler() {
		return this._handler;
	}

	get name() {
		return this._handlerName;
	}

	get always() {
		return this._always;
	}
}

class ProxyHandlerImpl extends BaseHandlerImpl implements ProxyHandler {
	static HINT = 'proxy';
	private _originName: string;

	constructor(handlerName: string, handler: any, originName: string, always: boolean = false) {
		super(handlerName, handler, always);
		this._originName = originName;
	}

	private async getOrigin(): Promise<OriginConfig> {
		const edgioConfig = await ConfigLoader.loadEdgioConfig();

		const origin = edgioConfig.origins.find((origin: any) => origin.name === this._originName);

		if (!origin) {
			throw new Error(`Origin '${this._originName}' not found in edgio.config.js`);
		}

		const scheme = origin.hosts[0].scheme || 'https';
		const hostname = Array.isArray(origin.hosts[0].location)
			? origin.hosts[0].location[0].hostname
			: origin.hosts[0].location;
		const port = Array.isArray(origin.hosts[0].location) ? origin.hosts[0].location[0].port || 443 : 443;
		const overrideHostHeader = origin.override_host_header || hostname;

		return { scheme, hostname, port, overrideHostHeader };
	}

	async transformRequest(request: any) {
		const transformHandler = this.handler?.transformRequest || this.handler?.default?.transformRequest;

		if (transformHandler) {
			transformHandler(request);
		}

		return request;
	}

	async transformResponse(response: any, request: any, rawBody: any) {
		const transformHandler =
			this.handler?.transformResponse || this.handler?.default?.transformResponse || this.handler?.default?.default;

		if (transformHandler) {
			transformHandler(response, request, rawBody);
		}
	}

	async handleRequest(request: any, response: any) {
		logger.debug(`Handling request for '${this._handlerName}' to '${this._originName}'`);
		const { scheme, hostname, port, overrideHostHeader } = await this.getOrigin();

		// Transform the request prior to proxying to ensure the host header and
		// origin properties are set correctly
		await this.transformRequest(request);

		const protocol = scheme === 'https' ? https : http;

		request.headers.set('host', overrideHostHeader || hostname);

		const headers = Object.fromEntries(request.headers.entries());

		const upstreamOptions = {
			method: request.method,
			hostname,
			port,
			path: request.url,
			headers,
		};

		await new Promise<void>((resolve, reject) => {
			const proxyReq = protocol.request(upstreamOptions, (proxyRes) => {
				logger.info(`Received response from upstream: ${proxyRes.statusCode}`);

				const encoding = proxyRes.headers['content-encoding'];
				const chunks: any[] = [];
				proxyRes.on('data', (chunk) => chunks.push(chunk));

				proxyRes.on('end', async () => {
					try {
						let body = Buffer.concat(chunks);

						const decompressedBody = await decompress(body, encoding ?? '');
						await this.transformResponse(proxyRes, proxyReq, decompressedBody);
						let transformedBody = (proxyRes as any).body;

						if (transformedBody && transformedBody !== body) {
							transformedBody = Buffer.isBuffer(transformedBody) ? transformedBody : Buffer.from(transformedBody);
							const compressedBody = await compress(transformedBody, encoding ?? '');

							const headers = { ...proxyRes.headers };
							if (encoding) {
								headers['content-encoding'] = encoding;
								headers['content-length'] = Buffer.byteLength(compressedBody).toString();
							} else {
								delete headers['content-encoding'];
								headers['content-length'] = Buffer.byteLength(compressedBody).toString();
							}

							response.writeHead(proxyRes.statusCode, headers);
							response.end(compressedBody);
						} else {
							response.writeHead(proxyRes.statusCode, proxyRes.headers);
							response.end(body);
						}
						resolve();
					} catch (error) {
						reject(error);
					}
				});
			});

			request.pipe(proxyReq);

			proxyReq.on('error', (err: any) => {
				logger.error(`Proxy request error: ${err}`);
				response.statusCode = 502;
				response.end('Bad Gateway');
				reject(err);
			});
		});
	}
}

class ComputeHandlerImpl extends BaseHandlerImpl {
	static HINT = 'compute';

	constructor(name: string, handler: any, always: boolean = false) {
		super(name, handler, always);
	}

	async handleRequest(request: any, response: any) {
		const computeHandler = this.handler.default?.default || this.handler.default;
		// User is responsible for writing the response
		await computeHandler(request, response);
	}
}

export async function loadHandlersFromConfig(
	config: EdgioProxyTransformConfig,
	componentPath: string
): Promise<Map<string, BaseHandlerImpl>> {
	const handlers = config.handlers;
	const componentRequire = createRequire(componentPath);
	const edgioConfig = await ConfigLoader.loadEdgioConfig();

	const handlerPromises = Object.entries(handlers).map(async ([name, options]) => {
		const { type, origin, always } = options;

		const importPath = getImportPath(config.outputDir, name);

		if (!importPath) {
			throw new Error(`Unable to find handler '${name}' at ${config.outputDir}`);
		}

		const handler = await import(componentRequire.resolve(importPath));

		switch (type) {
			case 'proxy':
				if (origin) {
					handlerInstanceCache.set(name, new ProxyHandlerImpl(name, handler, origin, always));
				} else {
					throw new Error(`Origin is required for handler type 'proxy'`);
				}
				break;
			case 'compute':
				handlerInstanceCache.set(name, new ComputeHandlerImpl(name, handler, always));
				break;
		}
	});

	// Add default origin handler
	const defaultOrigin = config.defaultOrigin || (edgioConfig.origins as any[])[0].name;
	if (defaultOrigin) {
		handlerInstanceCache.set('__default__', new ProxyHandlerImpl('__default__', null, defaultOrigin));
	}

	await Promise.all(handlerPromises);

	return handlerInstanceCache;
}

/**
 * Gets the handler instance for the given name, optionally including handlers that are always applied.
 * If the handler is not found and `includeAlways` is true, any handlers that are always applied will be returned.
 * @param name - The name of the handler to get
 * @param includeAlways - Whether to include handlers that are always applied
 * @returns An array of handlers
 */
export function getHandler(name: string, includeAlways: boolean = true): BaseHandlerImpl[] {
	const handlers: BaseHandlerImpl[] = [];

	handlerInstanceCache.forEach((handler, handlerName) => {
		if (handlerName === name || (includeAlways && handler.always)) {
			handlers.push(handler);
		}
	});

	return handlers;
}

/**
 * Gets the default origin handler.
 * @param includeAlways - Whether to include handlers that are always applied
 * @returns An array of handlers
 */
export function getDefaultOriginHandler(includeAlways: boolean = true): BaseHandlerImpl[] {
	return getHandler('__default__', includeAlways);
}

/**
 * Gets all handlers that are always applied.
 * @returns An array of handlers
 */
export function getAlwaysHandlers(): BaseHandlerImpl[] {
	return Array.from(handlerInstanceCache.values()).filter((handler) => handler.always);
}

function getImportPath(dir: string, name: string) {
	const resolvedPath = resolve(dir, name);

	return ['.js', '.cjs', '.mjs'].map((ext) => `${resolvedPath}${ext}`).find(existsSync);
}
