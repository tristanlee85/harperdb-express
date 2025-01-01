import { IncomingMessage, ClientRequest } from 'node:http';
import https from 'node:https';
import http from 'node:http';
import type { Config } from './config.js';
import { compress, decompress } from './utils/compression.js';
import { ConfigLoader } from './config.js';

// Handler import cache by path
const importedHandlers: Map<string, Promise<any>> = new Map();

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
	protected _handler: any;

	constructor(name: string, handler: any) {
		this._handlerName = name;
		this._handler = handler;
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

	constructor(handlerName: string, handler: any, originName: string) {
		super(handlerName, handler);
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

	constructor(name: string, handler: any) {
		super(name, handler);
	}

	async handleRequest(request: any, response: any) {
		// User is responsible for writing the response
		this.handler(request, response);
	}
}

export async function loadHandlersFromConfig(config: Config): Promise<Record<string, BaseHandlerImpl>> {
	const handlers = config.handlers;

	Object.entries(handlers).forEach(async ([name, options]) => {
		const { type, path, origin } = options;

		const handler = await import(path);

		switch (type) {
			case 'proxy':
				handlerInstanceCache[name] = new ProxyHandlerImpl(name, handler, origin ?? '');
				break;
			case 'compute':
				handlerInstanceCache[name] = new ComputeHandlerImpl(name, handler);
				break;
		}
	});

	return handlerInstanceCache;
}

export async function getHandler(name: string): Promise<BaseHandlerImpl> {
	const handler = handlerInstanceCache.get(name);

	if (!handler) {
		throw new Error(`Handler '${name}' not found`);
	}

	return handler;
}
