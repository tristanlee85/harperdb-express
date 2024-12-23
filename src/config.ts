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
	static async loadConfig(configPath: string): Promise<Config> {
		return (this.instance = await import(path.resolve(process.cwd(), configPath))) as Config;
	}

	static async loadEdgioConfig(): Promise<any> {
		return (
			this._edgioConfig ||
			((this._edgioConfig = (await import(path.resolve(process.cwd(), 'edgio.config.js'))).default) as any)
		);
	}
}
