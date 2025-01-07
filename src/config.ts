import fs from 'node:fs';
import path from 'node:path';
import yaml from 'yaml';
import { z } from 'zod';
import { fromError } from 'zod-validation-error';
import { EXTENSION_NAME } from './extension';

export type HandlerConfig = {
	type: 'proxy' | 'compute';
	path: string;
	origin: string;
	always: boolean;
};

export type EdgioProxyTransformConfig = {
	package: string;
	outputDir: string;
	handlers: {
		[key: string]: HandlerConfig;
	};
};

export type HDBConfig = {
	[EXTENSION_NAME]: EdgioProxyTransformConfig;
};

async function getValidOrigins(): Promise<string[]> {
	const edgioConfig = await ConfigLoader.loadEdgioConfig();
	return edgioConfig.origins.map((origin: any) => origin.name);
}

// Enhanced handler schema with dynamic origin validation
const createHandlerConfigSchema = async () => {
	const validOrigins = await getValidOrigins();

	return z.object({
		type: z
			.union([z.literal('proxy'), z.literal('compute')])
			.describe('The handler type must be either "proxy" or "compute".'),
		path: z
			.string()
			.nonempty('The "path" property cannot be empty.')
			.describe('The path to be handled by this configuration.'),
		origin: z
			.string()
			.nonempty('The "origin" property cannot be empty.')
			.refine(
				(origin) => validOrigins.includes(origin),
				(origin) => ({
					message: `Invalid origin '${origin}'. Must be one of: ${validOrigins.join(', ')}`,
				})
			)
			.describe('The origin server for the handler configuration.'),
		always: z.boolean().default(false).describe('Whether the handler should always be applied.'),
	});
};

const createHDBConfigSchema = async () => {
	const handlerConfigSchema = await createHandlerConfigSchema();

	return z.object({
		[EXTENSION_NAME]: z.object({
			package: z
				.string()
				.nonempty('The "package" property is required and cannot be empty.')
				.describe('The name of the package being used.'),
			outputDir: z
				.string()
				.nonempty('The "outputDir" property is required and cannot be empty.')
				.describe('The output directory for the build files.'),
			handlers: z
				.record(handlerConfigSchema)
				.describe('The handlers configuration must be an object where keys represent handler names.'),
		}),
	});
};

export class ConfigLoader {
	private static _edgioConfig: any;

	/**
	 * Loads the HDB configuration from the given file path and validates it.
	 * @param configPath - Path to the configuration file.
	 * @returns The validated EdgioProxyTransformConfig.
	 */
	static async loadHDBConfig(configPath: string = 'config.yaml'): Promise<EdgioProxyTransformConfig> {
		configPath = path.resolve(process.cwd(), configPath);

		let parsedConfig;
		try {
			const fileContent = fs.readFileSync(configPath, 'utf8');
			parsedConfig = yaml.parse(fileContent);
		} catch (error: any) {
			throw new Error(`Failed to load or parse the configuration file at ${configPath}: ${error.message}`);
		}

		const hdbConfigSchema = await createHDBConfigSchema();

		// Validate the parsed configuration
		const validationResult = hdbConfigSchema.safeParse(parsedConfig);

		if (!validationResult.success) {
			const message = fromError(validationResult.error);
			throw new Error(`Invalid HDBConfig:\n${message}`);
		}

		return validationResult.data[EXTENSION_NAME];
	}

	/**
	 * Loads the Edgio configuration file.
	 * @returns The Edgio configuration object.
	 */
	static async loadEdgioConfig(): Promise<any> {
		return (
			this._edgioConfig ||
			((this._edgioConfig = (await import(path.resolve(process.cwd(), 'edgio.config.js'))).default) as any)
		);
	}
}
