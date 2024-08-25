import assert from 'node:assert';
import {readFile} from 'node:fs/promises';
import {builtinModules} from 'node:module';
import {basename} from 'node:path';
import type {PackageJson} from 'type-fest';
import {normalizePath, type Plugin} from 'vite';

export type ViteVsCodeOptions<T extends PackageJson = PackageJson> = {
	readonly packageJsonTransformers?:
		| ReadonlyArray<(json: T) => T | void | Promise<T | void>>
		| undefined;
	readonly copyPaths?: string[] | undefined;
};

export function vscode<T extends PackageJson = PackageJson>({
	packageJsonTransformers = [],
	copyPaths = [],
}: ViteVsCodeOptions<T> = {}): Plugin {
	return {
		name: 'package-json',
		config(config, env) {
			return {
				resolve: {
					mainFields: ['module', 'jsnext:main', 'jsnext'],
					conditions: ['node'],
				},
				build: {
					target: ['node20', 'chrome122'],
					lib: {
						entry: '.',
						fileName: 'index',
						formats: ['cjs'],
					},
					rollupOptions: {
						external: [
							'vscode',
							...builtinModules.map((i) => `node:${i}`),
						],
					},
					sourcemap: env.mode !== 'production',
					minify: env.mode === 'production',
				},
			};
		},
		async generateBundle(options, bundle) {
			const resolvedEntry = await this.resolve('.');
			assert(resolvedEntry);
			const normalizedEntry = normalizePath(resolvedEntry.id);

			const chunk = Object.values(bundle).find(
				(chunk) =>
					chunk.type === 'chunk' &&
					chunk.isEntry &&
					chunk.facadeModuleId &&
					normalizePath(chunk.facadeModuleId) === normalizedEntry,
			);

			assert(chunk, 'Cannot find entry');

			const resolvedJson = await this.resolve(
				'./package.json',
				undefined,
			);

			assert(resolvedJson, 'Cannot resolve package.json');

			const packageString = await readFile(resolvedJson.id, 'utf8');
			let packageJson = JSON.parse(packageString) as T;

			packageJson.main = chunk.fileName;

			for (const f of packageJsonTransformers) {
				// eslint-disable-next-line no-await-in-loop
				packageJson = (await f(packageJson)) ?? packageJson;
			}

			this.emitFile({
				type: 'asset',
				originalFileName: resolvedJson.id,
				fileName: 'package.json',
				source: JSON.stringify(packageJson, undefined, '\t'),
			});

			for (const path of copyPaths) {
				// eslint-disable-next-line no-await-in-loop
				const resolved = await this.resolve(path, undefined);
				assert(resolved, 'Cannot resolve package.json');

				// eslint-disable-next-line no-await-in-loop
				const string = await readFile(resolved.id, 'utf8');

				this.emitFile({
					type: 'asset',
					originalFileName: resolved.id,
					fileName: basename(resolved.id),
					source: string,
				});
			}
		},
	};
}
