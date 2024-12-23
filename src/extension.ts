import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';
import http from 'node:http';
import https from 'node:https';
import { decompress, compress } from './utils/compression';
import { ConfigLoader } from './config';
import { getHandler, loadHandlersFromConfig } from './handlers';

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
 * @property {string=} configPath - Path to a configuration file to be used by the extension.
 */
export type ExtensionOptions = {
	configPath?: string;
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
	assertType('configPath', options.configPath, 'string');

	return {
		configPath: options.configPath ?? 'edgio.proxy.config.js',
		edgioConfigPath: options.edgioConfigPath ?? 'edgio.config.js',
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
			const proxyConfig = await ConfigLoader.loadConfig(config.configPath);

			// Prepare the transform handlers
			const transformHandlers = await loadHandlersFromConfig(proxyConfig);
			console.log('transformHandlers', transformHandlers);

			if (!fs.existsSync(componentPath) || !fs.statSync(componentPath).isDirectory()) {
				throw new Error(`Invalid component path: ${componentPath}`);
			}

			// Hook into `options.server.http`
			options.server.http(async (request: any, nextHandler: any) => {
				const { _nodeRequest: req, _nodeResponse: res } = request;

				// TODO: the rule provided will contain the handler name
				const name = 'myProxyHandler';
				console.log('name', name);

				const handler = await getHandler(name);
				await handler.handleRequest(req, res);
			});

			return true;
		},
	};
}
