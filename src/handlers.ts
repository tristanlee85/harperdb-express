import { IncomingMessage, ClientRequest } from 'node:http';
import { spawnSync } from 'child_process';
import path from 'node:path';
import { tmpdir } from 'os';
import fs from 'fs/promises';
import type { ExtensionOptions } from './extension';
import * as config from '../edgio.proxy.config.js';
import type { Config } from './config.js';

const handlerBuildCache: Map<string, Promise<any>> = new Map();

type BaseHandler = {
	handleRequest: (request: ClientRequest, response: IncomingMessage) => Promise<void>;
};

type ProxyHandler = {
	transformRequest?: (request: ClientRequest) => Promise<IncomingMessage>;
	transformResponse?: (
		rawBody: Buffer,
		response: IncomingMessage,
		request: ClientRequest
	) => Promise<Buffer | string | undefined>;
};

type ComputeHandler = {};

class BaseHandlerImpl implements BaseHandler {
	protected _handlerName: string;
	protected _handler: Promise<any>;

	constructor(handlerName: string, handlerPath: string) {
		this._handlerName = handlerName;
		this._handler = buildAndImportHandler(handlerPath);
	}

	async handleRequest(request: ClientRequest, response: IncomingMessage) {
		throw new Error('Not implemented');
	}

	get handler() {
		return this._handler;
	}
}

class ProxyHandlerImpl extends BaseHandlerImpl implements ProxyHandler {
	static HINT = 'proxy';

	constructor(handlerName: string, handlerPath: string) {
		super(handlerName, handlerPath);
		this._handler = this._handler
			.then((handler) => {
				logger.debug(`Proxy handler '${handlerName}' built successfully.`);
			})
			.catch((err) => {
				logger.error(`Unable to compile '${handlerPath}': ${err}`);
				handlerBuildCache.delete(handlerPath);
				return;
			});
	}

	get transformRequest() {
		return async (request: ClientRequest) => {
			const handlerModule = await this.handler;
			return handlerModule.transformRequest(request);
		};
	}

	get transformResponse() {
		return async (rawBody: Buffer, response: IncomingMessage, request: ClientRequest) => {
			const handlerModule = await this.handler;
			return handlerModule.transformResponse(rawBody, response, request);
		};
	}

	async handleRequest(request: ClientRequest, response: IncomingMessage) {
		// TODO perhaps this could do the proxy instead of the other extension??
	}
}

class ComputeHandlerImpl extends BaseHandlerImpl implements ComputeHandler {
	static HINT = 'compute';

	constructor(handlerName: string, handlerPath: string) {
		super(handlerName, handlerPath);
		this._handler
			.then((handler) => {
				logger.debug(`Compute handler '${handlerName}' built successfully.`);
				return handler;
			})
			.catch((err) => {
				logger.error(`Unable to compile '${handlerPath}': ${err}`);
				handlerBuildCache.delete(handlerPath);
			});
	}

	async handleRequest(request: ClientRequest, response: IncomingMessage) {
		// TODO
	}
}

// export class Handler {
// 	private _handler: BaseHandler;

// 	constructor(handler: BaseHandler) {
// 		this._handler = handler;
// 	}

// 	// ** TODO: May not be necessary depending on how the rule transform object is defined
// 	//
// 	/**
// 	 * Validate rules and return handlers matching the defined hint types.
// 	 * @param rules Array of rules to validate
// 	 * @param config Configuration object
// 	 * @returns Matched handlers
// 	 */
// 	// static validateHandlers(rules: Rule[], config: ExtensionOptions['handlers']): Record<string, BaseHandler> {
// 	// 	const handlerTypes = [ProxyHandlerImpl, ComputeHandlerImpl];

// 	// 	return rules.reduce(
// 	// 		(acc, rule) => {
// 	// 			const handlerName = rule.features?.headers?.set_request_headers?.['+x-cloud-functions-hint'];
// 	// 			if (!handlerName) return acc;

// 	// 			const [handlerType, handlerId] = handlerName.split(':');
// 	// 			if (!handlerType || !handlerId) return acc;

// 	// 			const MatchedHandler = handlerTypes.find((handler) => handler.HINT === handlerType);

// 	// 			if (MatchedHandler) {
// 	// 				const configHandler = config?.[handlerName];
// 	// 				if (!configHandler) {
// 	// 					//@ts-ignore
// 	// 					logger.warn(`Missing handler '${handlerName}' in config.yaml.`);
// 	// 					return acc;
// 	// 				}

// 	// 				acc[handlerName] = new MatchedHandler(handlerName, configHandler);
// 	// 			}

// 	// 			return acc;
// 	// 		},
// 	// 		{} as Record<string, BaseHandler>
// 	// 	);
// 	// }
// }

export async function getHandlersFromConfig(config: Config): Promise<Record<string, BaseHandlerImpl>> {
	const handlerTypes = [ComputeHandlerImpl, ProxyHandlerImpl];
	const handlers = config.transforms;

	const handlerInstances = Object.entries(handlers).map(([handlerName, handlerPath]): [string, BaseHandlerImpl] => {
		const [handlerType, handlerId] = handlerName.split(':');

		if (!handlerType || !handlerId) {
			throw new Error(`Invalid handler name: ${handlerName}`);
		}

		const MatchedHandler = handlerTypes.find((handler) => handler.HINT === handlerType);

		if (!MatchedHandler) {
			throw new Error(
				`Invalid handler type: ${handlerType}. Valid types are: ${handlerTypes.map((handler) => handler.HINT).join(', ')}`
			);
		}

		const handlerInstance = new MatchedHandler(handlerName, handlerPath);
		return [handlerName, handlerInstance];
	});

	const resolvedHandlers = await Promise.all(
		handlerInstances.map(([handlerName, handlerInstance]) => handlerInstance.handler)
	);

	return Object.fromEntries(resolvedHandlers);
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
