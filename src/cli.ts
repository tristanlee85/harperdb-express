#!/usr/bin/env node
import child_process from 'node:child_process';
import path from 'node:path';
import { ConfigLoader } from './config';
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';

const cwd = process.cwd();

const argv = yargs(hideBin(process.argv))
	.command(
		'bundle',
		'Bundles the handlers',
		{
			out: {
				alias: 'o',
				type: 'string',
				describe: `Output directory for the bundle. Defaults to the 'outputDir' in the config.yaml file.`,
			},
			format: {
				alias: 'f',
				type: 'string',
				default: 'esm',
				describe: 'Format of the bundle',
				choices: ['esm', 'cjs'],
			},
		},
		async ({ out, format }) => {
			const hdbConfigPath = path.resolve(cwd, 'config.yaml');
			const hdbConfig = await ConfigLoader.loadHDBConfig(hdbConfigPath);

			const { handlers, outputDir } = hdbConfig;

			// Bundle the handlers
			Object.entries(handlers).forEach(([key, handler]) => {
				const handlerPath = path.resolve(cwd, handler.path);
				const extension = format === 'cjs' ? 'cjs' : 'mjs';
				const outPath = path.join(out ?? outputDir, `${key}.${extension}`);
				console.log(`Bundling ${key} to ${outPath}...`);
				const p = child_process.spawnSync(
					'bun',
					['build', handlerPath, '--target', 'node', '--format', format, '--outfile', outPath],
					{
						cwd,
						stdio: 'inherit',
					}
				);
				if (p.status !== 0) {
					console.error(`Bundling ${key} exited with code ${p.status}`);
					process.exit(1);
				}
			});
		}
	)
	.help().argv;
