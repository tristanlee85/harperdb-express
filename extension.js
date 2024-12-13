import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';
import { createRequire } from 'node:module';
import express from 'express';
import proxy from 'express-http-proxy';
import * as cheerio from 'cheerio';

/**
 * Logger override for logging in this extension.
 */
logger.info = (message) => {
	console.log(`[harperdb-express] ${message}`);
};
logger.debug = (message) => {
	console.log(`[harperdb-express] ${message}`);
};
logger.error = (message) => {
	console.error(`[harperdb-express] ${message}`);
};

/**
 * @typedef {Object} Transformer
 * @property {function(RequestOptions): RequestOptions} transformRequestOptions - Function to transform request options.
 * @property {function(Request): string} transformRequestPath - Function to transform request path.
 * @property {function(ProxyRes, ProxyResData, UserReq, UserRes): string} transformResponse - Function to transform response.
 */

/**
 * @typedef {Object} Middleware
 * @property {function(Request, Response, NextFunction): void} middleware - Function to transform request options.
 */

/**
 * Define a list of allowed hosts to validate an incoming `x-forwarded-host`
 * header that could be used to make this more dynamic in the future.
 *
 * Validating the incoming host should help prevent abuse by restricting
 * the passed host header to the allowedHosts list.
 */
const allowedHosts = new Set(['83c5-2600-1700-f2e0-b0f-74f7-c2c1-a4ad-e69d.ngrok-free.app']);

/**
 *
 * The 'proxy' library accepts a function to determine the proxy host.
 *
 * @param {IncomingMessage} param0
 * @returns {string} Hostname
 */
const determineProxyHost = ({ headers }) => {
	// Return the hostname (TODO: make this more dynamic)
	return 'https://www.google.com';
};

/**
 * @typedef {Object} ExtensionOptions - The configuration options for the extension.
 * @property {number=} port - A port for the Express.js server. Defaults to 3000.
 * @property {string=} subPath - A sub path for serving requests from. Defaults to `''`.
 * @property {string=} middlewarePath - A path to a middleware file to be used by the Express.js server.
 * @property {string=} transformerPath - A path to a transformer file to be used by the Express.js server.
 * @property {string=} staticPath - A path to a static files directory to be served by the Express.js server.
 * @property {Array<{pattern: string, host: string}>} routes - Configurable routes for proxying requests.
 */

/**
 * Assert that a given option is a specific type.
 * @param {string} name The name of the option.
 * @param {any=} option The option value.
 * @param {string} expectedType The expected type (i.e. `'string'`, `'number'`, `'boolean'`, etc.).
 */
function assertType(name, option, expectedType) {
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
function resolveConfig(options) {
	assertType('port', options.port, 'number');
	assertType('subPath', options.subPath, 'string');
	assertType('middlewarePath', options.middlewarePath, 'string');
	assertType('transformerPath', options.transformerPath, 'string');
	assertType('staticPath', options.staticPath, 'string');
	assertType('routes', options.routes, 'object');

	// Remove leading and trailing slashes from subPath
	if (options.subPath?.[0] === '/') {
		options.subPath = options.subPath.slice(1);
	}
	if (options.subPath?.[options.subPath?.length - 1] === '/') {
		options.subPath = options.subPath.slice(0, -1);
	}

	return {
		port: options.port ?? 3000,
		subPath: options.subPath ?? '',
		middlewarePath: options.middlewarePath ?? '',
		transformerPath: options.transformerPath ?? '',
		staticPath: options.staticPath ?? '',
		routes: options.routes ?? [],
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
export function start(options = {}) {
	const config = resolveConfig(options);

	logger.info(`Starting extension...`);

	return {
		async handleDirectory(_, componentPath) {
			logger.info(`Setting up Express.js app...`);
			let middlewareFn;
			let transformReqOptionsFn;
			let transformReqPathFn;
			let transformResFn;

			if (!fs.existsSync(componentPath) || !fs.statSync(componentPath).isDirectory()) {
				throw new Error(`Invalid component path: ${componentPath}`);
			}

			// User-defined middleware
			if (!!config.middlewarePath) {
				// Check to ensure the middleware path is a valid file
				if (!fs.existsSync(config.middlewarePath) || !fs.statSync(config.middlewarePath).isFile()) {
					throw new Error(`Invalid middleware path: ${config.middlewarePath}`);
				}

				// Middleware must be be a module with a default export
				const importPath = path.resolve(componentPath, config.middlewarePath);
				const middleware = (await import(importPath)).default;

				if (typeof middleware !== 'function') {
					throw new Error(`Middleware must be a function. Received: ${typeof middleware}`);
				}

				middlewareFn = middleware;
			}

			// User-defined transformer
			if (!!config.transformerPath) {
				// Check to ensure the transformer path is a valid file
				if (!fs.existsSync(config.transformerPath) || !fs.statSync(config.transformerPath).isFile()) {
					throw new Error(`Invalid transformer path: ${config.transformerPath}`);
				}

				// Transformer must be be a module with a default export
				const importPath = path.resolve(componentPath, config.transformerPath);
				const { transformRequestOptions, transformRequestPath, transformResponse } = await import(importPath);

				console.log('transformRequestOptions', transformRequestOptions);
				console.log('transformRequestPath', transformRequestPath);
				console.log('transformResponse', transformResponse);

				transformReqOptionsFn = transformRequestOptions;
				transformReqPathFn = transformRequestPath;
				transformResFn = transformResponse;
			}

			const app = express();

			// Middleware for subPath handling
			app.use((req, res, next) => {
				if (config.subPath && !req.url.startsWith(`/${config.subPath}/`)) {
					return next(); // Not a matching path; skip handling
				}

				// Rewrite the URL to remove the subPath prefix
				req.url = config.subPath ? req.url.replace(new RegExp(`^/${config.subPath}/`), '/') : req.url;

				next();
			});

			// Middleware to validate host
			app.use((req, res, next) => {
				const host = req.headers['x-forwarded-host'] || req.hostname;
				if (!allowedHosts.has(host)) {
					console.error(`Rejected request from unauthorized host: ${host}`);
					//return res.status(403).send('Forbidden');
				}
				next();
			});

			if (middlewareFn) {
				logger.info(`Using middleware: ${config.middlewarePath}`);
				app.use(middlewareFn);
			}

			app.use(
				proxy(determineProxyHost, {
					/**
					 *
					 * Set the 'accept-encoding' header so that the origin hopefully
					 * responds with gzip data so the 'proxy' library can decompress the
					 * stream as part of the PoC.
					 *
					 */
					proxyReqOptDecorator: (proxyReqOpts) => {
						proxyReqOpts.headers['accept-encoding'] = 'gzip';
						return transformReqOptionsFn ? transformReqOptionsFn(proxyReqOpts) : proxyReqOpts;
					},

					proxyReqPathResolver: (req) => {
						return transformReqPathFn ? transformReqPathFn(req) : req.url;
					},

					userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
						return transformResFn ? transformResFn(proxyRes, proxyResData, userReq, userRes) : proxyResData;
					},
				})
			);

			// Configure route patterns with proxying and response handling
			// config.routes.forEach(({ pattern, host }) => {
			// 	logger.info(`Setting up route: ${pattern} -> ${host}`);
			// 	app.use(
			// 		pattern,
			// 		proxy(host, {
			// 			proxyReqPathResolver: (req) => req.url,
			// 			// userResDecorator: async (proxyRes, proxyResData, req, res) => {
			// 			// 	const contentType = proxyRes.headers['content-type'] || '';
			// 			// 	if (contentType.includes('text/html')) {
			// 			// 		const $ = cheerio.load(proxyResData.toString('utf-8'));
			// 			// 		// Example: Append a custom footer to the page
			// 			// 		$('body').append('<footer>Custom Footer</footer>');
			// 			// 		return $.html();
			// 			// 	}
			// 			// 	return proxyResData;
			// 			// },
			// 		})
			// 	);
			// });

			// Middleware for static files
			if (!!config.staticPath) {
				const staticPath = path.join(componentPath, config.staticPath);
				if (fs.existsSync(staticPath)) {
					app.use(express.static(staticPath));
					logger.info(`Serving static files from: ${staticPath}`);
				}
			}

			// Hook into `options.server.http`
			options.server.http(async (request, nextHandler) => {
				const { _nodeRequest: req, _nodeResponse: res } = request;

				logger.info(`Incoming request: ${req.url}`);

				app.handle(req, res, (err) => {
					if (err) {
						logger.error(`Error handling request: ${err.message}`);
						res.statusCode = 500;
						res.end('Internal Server Error');
					} else {
						nextHandler(request);
					}
				});
			});

			// Start the Express server
			const port = config.port;
			app.listen(port, () => {
				logger.info(`Express.js server is running on port ${port}`);
			});

			return true;
		},
	};
}
