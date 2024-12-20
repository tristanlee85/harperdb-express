import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';
import http from 'node:http';
import https from 'node:https';
import { decompress, compress } from './utils/compression';

declare const logger: any;

/**
 * Patch `logger` methods to include prefix
 */
const [logInfo, logDebug, logError, logWarn] = ['info', 'debug', 'error', 'warn'].map((method) => {
	const fn = logger[method];
	return (message: string) => {
		fn(`[harperdb-proxy-transform] ${message}`);
	};
});

/**
 * @typedef {Object} ExtensionOptions - The configuration options for the extension.
 * @property {string=} transformerPath - A path to a transformer file to be used by the Express.js server.
 */
export type ExtensionOptions = {
	transformerPath?: string;
};

/**
 * Assert that a given option is a specific type.
 * @param {string} name The name of the option.
 * @param {any=} option The option value.
 * @param {string} expectedType The expected type (i.e. `'string'`, `'number'`, `'boolean'`, etc.).
 */
function assertType(name: string, option: any, expectedType: string) {
	if (option) {
		const found = typeof option;
		assert.strictEqual(found, expectedType, `${name} must be type ${expectedType}. Received: ${found}`);
	}
}

/**
 * Resolves the incoming extension options into a config for use throughout the extension.
 * @param {ExtensionOptions} options - The options object to be resolved into a configuration.
 * @returns {Required<ExtensionOptions>}
 */
function resolveConfig(options: ExtensionOptions) {
	assertType('transformerPath', options.transformerPath, 'string');

	return {
		transformerPath: options.transformerPath ?? '',
	};
}

/**
 * This method is executed on each worker thread, and is responsible for
 * returning a Resource Extension that will subsequently be executed on each
 * worker thread.
 *
 * The Resource Extension is responsible for creating the Next.js server, and
 * hooking into the global HarperDB server.
 *
 * @param {ExtensionOptions} options
 * @returns
 */
export function start(options: any) {
	const config = resolveConfig(options);

	logInfo(`Starting extension...`);

	return {
		async handleDirectory(_: any, componentPath: string) {
			let transformReqFn: ((req: any) => Promise<void>) | undefined;
			let transformResFn: ((rawBody: Buffer, res: any, req: any) => Promise<Buffer | string | undefined>) | undefined;

			if (!fs.existsSync(componentPath) || !fs.statSync(componentPath).isDirectory()) {
				throw new Error(`Invalid component path: ${componentPath}`);
			}

			// User-defined transformer
			if (!!config.transformerPath) {
				// Check to ensure the transformer path is a valid file
				const importPath = path.resolve(componentPath, config.transformerPath);
				if (!fs.existsSync(importPath) || !fs.statSync(importPath).isFile()) {
					throw new Error(`Invalid transformer path: ${importPath}`);
				}

				// Transformer must be be a module with named exports
				const { transformRequest, transformResponse } = await import(importPath);

				transformReqFn = transformRequest;
				transformResFn = transformResponse;
			}

			// Hook into `options.server.http`
			options.server.http(async (request: any, nextHandler: any) => {
				const { _nodeRequest: req, _nodeResponse: res } = request;

				const { transformRequest, transformResponse } = request.edgio?.proxyHandler ?? {};

				// Per-request transformers should override those defined in the extension
				if (transformRequest) {
					transformReqFn = transformRequest;
				}
				if (transformResponse) {
					transformResFn = transformResponse;
				}

				try {
					logDebug(`Incoming request: ${req.url.split('?')[0]}`);

					if (transformReqFn) {
						await transformReqFn(req);
					}

					// TODO: this property will should be defined by the edge-control-parser extension
					const scheme = 'https';
					const host = 'www.google.com';
					req.headers.host = host;

					const protocol = scheme === 'https' ? https : http;

					const upstreamOptions = {
						method: req.method,
						hostname: host,
						port: scheme === 'https' ? 443 : 80,
						path: req.url,
						headers: req.headers,
					};

					const proxyReq = protocol.request(upstreamOptions, (proxyRes) => {
						logDebug(`Received response from upstream: ${proxyRes.statusCode}`);

						const encoding = proxyRes.headers['content-encoding'];
						const chunks: any[] = [];
						proxyRes.on('data', (chunk) => chunks.push(chunk));

						proxyRes.on('end', async () => {
							let body = Buffer.concat(chunks);

							if (transformResFn) {
								const decompressedBody = await decompress(body, encoding ?? '');
								let transformedBody = await transformResFn(decompressedBody, proxyRes, proxyReq);

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

									res.writeHead(proxyRes.statusCode, headers);
									res.end(compressedBody);
									return;
								}
							}

							res.writeHead(proxyRes.statusCode, proxyRes.headers);
							res.end(body);
						});
					});

					req.pipe(proxyReq);

					proxyReq.on('error', (err: any) => {
						logError(`Proxy request error: ${err}`);
						res.statusCode = 502;
						res.end('Bad Gateway');
					});
				} catch (error) {
					// General error handling
					logError(`Error handling proxy request: ${error}`);
					res.statusCode = 500;
					res.end('Internal Server Error');
				}
			});

			return true;
		},
	};
}
