import path from 'node:path';

export type Config = {
	transforms: Record<string, string>;
};

export class ConfigLoader {
	static instance: Config;
	static async loadConfig(configPath: string): Promise<Config> {
		return (this.instance = await import(path.resolve(process.cwd(), configPath))) as Config;
	}
}
