import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';
import express from 'express';
import proxy from 'express-http-proxy';
import cheerio from 'cheerio';

/**
 * Define a list of allowed hosts to validate an incoming `x-forwarded-host`
 * header that could be used to make this more dynamic in the future.
 *
 * Validating the incoming host should help prevent abuse by restricting
 * the passed host header to the allowedHosts list.
 */
const allowedHosts = new Set(['83c5-2600-1700-f2e0-b0f-74f7-c2c1-a4ad-e69d.ngrok-free.app']);

/**
 * @typedef {Object} ExtensionOptions - The configuration options for the extension.
 * @property {number=} port - A port for the Express.js server. Defaults to 3000.
 * @property {string=} subPath - A sub path for serving requests from. Defaults to `''`.
 * @property {Object} servers - An object containing the server setup functions.
 * @property {Function} servers.http - A function to handle HTTP requests.
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
		servers: options.servers,
	};
}

/**
 * Start the Express.js server and configure it to integrate with `options.servers.http`.
 * @param {ExtensionOptions} options
 */
export function start(options = {}) {
	const config = resolveConfig(options);

	return {
		async handleDirectory(_, componentPath) {
			console.log(`Setting up Express.js app in ${componentPath}`);

			if (!fs.existsSync(componentPath) || !fs.statSync(componentPath).isDirectory()) {
				throw new Error(`Invalid component path: ${componentPath}`);
			}

			const app = express();

			app.use((req, res, next) => {
				return res.status(200).send(`Hello World from ${req.url}`);
			});

			// // Middleware to validate host
			// app.use((req, res, next) => {
			//   const host = req.headers['x-forwarded-host'] || req.hostname;
			//   if (!allowedHosts.has(host)) {
			//     console.error(`Rejected request from unauthorized host: ${host}`);
			//     return res.status(403).send('Forbidden');
			//   }
			//   next();
			// });

			// // Middleware for proxying and DOM manipulation
			// app.use(
			//   proxy('https://example.com', {
			//     proxyReqPathResolver: (req) => req.url,
			//     userResDecorator: async (proxyRes, proxyResData, req, res) => {
			//       const contentType = proxyRes.headers['content-type'] || '';
			//       if (contentType.includes('text/html')) {
			//         const $ = cheerio.load(proxyResData.toString('utf-8'));
			//         // Example DOM manipulation
			//         $('title').text('Modified Title');
			//         return $.html();
			//       }
			//       return proxyResData;
			//     },
			//   })
			// );

			// Middleware for static files
			const staticPath = path.join(componentPath, 'public');
			if (fs.existsSync(staticPath)) {
				app.use(express.static(staticPath));
				console.log(`Serving static files from: ${staticPath}`);
			}

			// Middleware for subPath handling
			// app.use((req, res, next) => {
			//   if (config.subPath && !req.url.startsWith(`/${config.subPath}/`)) {
			//     return next(); // Not a matching path; skip handling
			//   }

			//   // Rewrite the URL to remove the subPath prefix
			//   req.url = config.subPath
			//     ? req.url.replace(new RegExp(`^/${config.subPath}/`), '/')
			//     : req.url;

			//   next();
			// });

			// Hook into `options.servers.http`
			config.servers.http(async (request, nextHandler) => {
				const { _nodeRequest: req, _nodeResponse: res } = request;

				app.handle(req, res, (err) => {
					if (err) {
						console.error(`Error handling request: ${err.message}`);
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
				console.log(`Express.js server is running on port ${port}`);
			});

			return true;
		},
	};
}
