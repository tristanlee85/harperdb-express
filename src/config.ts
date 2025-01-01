import fs from 'node:fs';
import path from 'node:path';

export type Config = {
	handlers: {
		[key: string]: {
			type: 'proxy' | 'compute';
			path: string;
			origin?: string;
		};
	};
};

export class ConfigLoader {
	private static _edgioConfig: any;

	static instance: Config;
	static async loadConfig(configPath: string = 'hdb-proxy.json'): Promise<Config> {
		configPath = path.resolve(process.cwd(), configPath);

		if (!fs.existsSync(configPath)) {
			throw new Error(`Config file ${configPath} not found. Run 'hdb-proxy bundle' to generate it.`);
		}

		const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

		return (this.instance = config) as Config;
	}

	static async loadEdgioConfig(): Promise<any> {
		return (
			this._edgioConfig ||
			((this._edgioConfig = (await import(path.resolve(process.cwd(), 'edgio.config.js'))).default) as any)
		);
	}
}
