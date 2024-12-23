import { IncomingMessage, ClientRequest } from 'node:http';
import { spawnSync } from 'child_process';
import path from 'node:path';
import https from 'node:https';
import http from 'node:http';
import { tmpdir } from 'os';
import fs from 'fs/promises';
import type { Config } from './config.js';
import { compress, decompress } from './utils/compression.js';
import { ConfigLoader } from './config.js';

// Handler import cache by path
const handlerBuildCache: Map<string, Promise<any>> = new Map();

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
	transformRequest?: (request: any) => Promise<IncomingMessage>;
	transformResponse?: (rawBody: Buffer, response: any, request: any) => Promise<Buffer | string | undefined>;
};

class BaseHandlerImpl implements BaseHandler {
	protected _handlerName: string;
	protected _handler: Promise<any>;

	constructor(handlerName: string, handlerPath: string) {
		this._handlerName = handlerName;
		this._handler = buildAndImportHandler(handlerPath)
			.then((handler) => {
				logger.debug(`Handler '${handlerName}' built successfully.`);
				return handler;
			})
			.catch((err) => {
				logger.error(`Unable to compile '${handlerPath}': ${err}`);
				handlerBuildCache.delete(handlerPath);
				return;
			});
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
}

class ProxyHandlerImpl extends BaseHandlerImpl implements ProxyHandler {
	static HINT = 'proxy';
	private _originName: string;

	constructor(handlerName: string, handlerPath: string, originName: string) {
		super(handlerName, handlerPath);
		this._originName = originName;
	}

	private async getOrigin(): Promise<OriginConfig> {
		let edgioConfig = await ConfigLoader.loadEdgioConfig();

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

	get transformRequest() {
		return async (request: any) => {
			const { transformRequest } = await this.handler;

			if (transformRequest) {
				return transformRequest(request);
			}

			return request;
		};
	}

	get transformResponse() {
		return async (rawBody: any, response: any, request: any) => {
			const handlerModule = await this.handler;
			return handlerModule.transformResponse(rawBody, response, request);
		};
	}

	async handleRequest(request: any, response: any) {
		const { scheme, hostname, port, overrideHostHeader } = await this.getOrigin();

		// Transform the request prior to proxying to ensure the host header and
		// origin properties are set correctly
		await this.transformRequest(request);

		const protocol = scheme === 'https' ? https : http;

		request.headers.host = overrideHostHeader || hostname;

		const upstreamOptions = {
			method: request.method,
			hostname,
			port,
			path: request.url,
			headers: request.headers,
		};

		const proxyReq = protocol.request(upstreamOptions, (proxyRes) => {
			logger.debug(`Received response from upstream: ${proxyRes.statusCode}`);

			const encoding = proxyRes.headers['content-encoding'];
			const chunks: any[] = [];
			proxyRes.on('data', (chunk) => chunks.push(chunk));

			proxyRes.on('end', async () => {
				let body = Buffer.concat(chunks);

				const decompressedBody = await decompress(body, encoding ?? '');
				let transformedBody = await this.transformResponse(decompressedBody, proxyRes, proxyReq);

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
					return;
				}

				response.writeHead(proxyRes.statusCode, proxyRes.headers);
				response.end(body);
			});
		});

		request.pipe(proxyReq);

		proxyReq.on('error', (err: any) => {
			logger.error(`Proxy request error: ${err}`);
			response.statusCode = 502;
			response.end('Bad Gateway');
		});
	}
}

class ComputeHandlerImpl extends BaseHandlerImpl {
	static HINT = 'compute';

	constructor(handlerName: string, handlerPath: string) {
		super(handlerName, handlerPath);
	}

	async handleRequest(request: any, response: any) {
		this.handler.then((handler) => {
			// User is responsible for writing the response
			handler(request, response);
		});
	}
}

export async function loadHandlersFromConfig(config: Config): Promise<Record<string, BaseHandlerImpl>> {
	const handlers = config.handlers;

	const handlerInstances = Object.entries(handlers)
		.map(([name, handler]): [string, BaseHandlerImpl] => {
			const { type, path, origin } = handler;

			switch (type) {
				case 'proxy':
					return [name, new ProxyHandlerImpl(name, path, origin ?? '')];
				case 'compute':
					return [name, new ComputeHandlerImpl(name, path)];
			}
		})
		.filter(Boolean);

	await Promise.all(
		handlerInstances.map(([name, handlerInstance]) => {
			handlerInstanceCache.set(name, handlerInstance);
			return handlerInstance.handler;
		})
	);

	return handlerInstances.reduce(
		(acc, [name, handlerInstance]): Record<string, BaseHandlerImpl> => {
			acc[name] = handlerInstance;
			return acc;
		},
		{} as Record<string, BaseHandlerImpl>
	);
}

export async function getHandler(name: string): Promise<BaseHandlerImpl> {
	const handler = handlerInstanceCache.get(name);

	if (!handler) {
		throw new Error(`Handler '${name}' not found`);
	}

	return handler;
}

async function buildAndImportHandler(handlerPath: string): Promise<any> {
	// Check if the handler is already built and cached
	if (handlerBuildCache.has(handlerPath)) {
		return handlerBuildCache.get(handlerPath);
	}

	// Otherwise, start building and add it to the cache
	const buildPromise = new Promise(async (resolve, reject) => {
		const tmpOutputPath = path.join(tmpdir(), `handler_${Date.now()}.mjs`);
		handlerPath = path.resolve(handlerPath);

		const buildResult = spawnSync(
			'bun',
			['build', handlerPath, '--target', 'node', '--format', 'esm', '--outfile', tmpOutputPath],
			{
				encoding: 'utf-8',
			}
		);

		if (buildResult.error || buildResult.status !== 0) {
			reject(new Error(`Unable to compile '${handlerPath}': ${buildResult.stderr || buildResult.error?.message}`));
			return;
		}

		const module = await import(`file://${tmpOutputPath}`);

		await fs.unlink(tmpOutputPath).catch(() => {});

		resolve(module.default || module);
	});

	handlerBuildCache.set(handlerPath, buildPromise);

	return buildPromise;
}
