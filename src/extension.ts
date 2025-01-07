import assert from 'node:assert';
import { ConfigLoader } from './config';
import { getHandler, getAlwaysHandlers, getDefaultOriginHandler, loadHandlersFromConfig } from './handlers';

export const EXTENSION_NAME = 'harperdb-proxy-transform';
const HEADER_HINT_NAME = '+x-cloud-functions-hint';

/**
 * @typedef {Object} ExtensionOptions - The configuration options for the extension.
 * @property {string=} configPath - Path to a configuration file to be used by the extension.
 */
type ExtensionOptions = {
	edgioConfigPath?: string;
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
	return {
		edgioConfigPath: options.edgioConfigPath ?? 'edgio.config.js',
	};
}

export function startOnMainThread(options: any) {
	return {
		async setupDirectory(_: any, componentPath: string) {
			// TODO: optionally bundle the handlers if they don't exist
			return true;
		},
	};
}

export function start(options: any) {
	const config = resolveConfig(options);

	return {
		async handleDirectory(_: any, componentPath: string) {
			const hdbConfig = await ConfigLoader.loadHDBConfig();

			// Prepare the proxy/compute handlers
			await loadHandlersFromConfig(hdbConfig, componentPath);

			// Hook into `options.server.http`
			options.server.http(async (request: any, nextHandler: any) => {
				const { _nodeRequest: req, _nodeResponse: res } = request;
				const { features, origins } = request.edgio;
				const defaultOriginHandler = getDefaultOriginHandler();

				if (features?.headers?.set_request_headers?.[HEADER_HINT_NAME]) {
					const handlerName = features.headers.set_request_headers.transform;
					const handlers = getHandler(handlerName, true);

					for (const handler of handlers) {
						await handler.handleRequest(req, res);
					}
				} else {
					for (const handler of defaultOriginHandler) {
						await handler.handleRequest(req, res);
					}
				}

				if (!res.headersSent) {
					return nextHandler(request);
				}
			});

			return true;
		},
	};
}
