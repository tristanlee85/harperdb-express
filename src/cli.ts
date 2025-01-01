#!/usr/bin/env node
import child_process from 'node:child_process';
import fs from 'node:fs';
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
				default: 'dist',
				describe: 'Output directory for the bundle',
			},
		},
		async ({ out }) => {
			const bundledConfigPath = path.resolve(cwd, 'hdb-proxy.json');
			const bundledConfig: Record<string, any> = {};

			const { handlers } = await ConfigLoader.loadConfig('./edgio.proxy.config.js');

			// Bundle the handlers
			Object.entries(handlers).forEach(([key, handler]) => {
				const handlerPath = path.resolve(cwd, handler.path);
				const outPath = path.join(out, `${key}.mjs`);
				console.log(`Bundling ${key} to ${outPath}...`);
				const p = child_process.spawnSync(
					'bun',
					['build', handlerPath, '--target', 'node', '--format', 'esm', '--outfile', outPath],
					{
						cwd,
						stdio: 'inherit',
					}
				);
				if (p.status !== 0) {
					console.error(`Bundling ${key} exited with code ${p.status}`);
					process.exit(1);
				}
				bundledConfig[key] = { ...handler, path: outPath };
			});

			fs.writeFileSync(bundledConfigPath, JSON.stringify(bundledConfig, null, 2));
		}
	)
	.help().argv;
