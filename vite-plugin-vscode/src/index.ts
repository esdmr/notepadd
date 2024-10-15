import assert from 'node:assert';
import {readFile} from 'node:fs/promises';
import {builtinModules} from 'node:module';
import type {PackageJson} from 'type-fest';
import {normalizePath, type Plugin, type Rollup} from 'vite';
import type {ExtensionManifest} from './types.ts';

export type VsCodePackageJson = PackageJson & ExtensionManifest;

export type ViteVsCodeOptions<T extends VsCodePackageJson = VsCodePackageJson> =
	{
		readonly packageJsonTransformers?:
			| ReadonlyArray<(json: T) => T | void | Promise<T | void>>
			| undefined;
		readonly copyPaths?: Record<string, string> | undefined;
	};

async function resolveAndNormalize(
	context: Rollup.PluginContext,
	...rest: Parameters<Rollup.PluginContext['resolve']>
) {
	const resolved = await context.resolve(...rest);
	assert(resolved, `Cannot resolve ${JSON.stringify(rest[0])}`);
	const normalizedId = normalizePath(resolved.id);
	return {...resolved, normalizedId};
}

function findChunkForId(
	bundle: Rollup.OutputBundle,
	resolution: {normalizedId: string},
) {
	const chunk = Object.values(bundle).find(
		(chunk) =>
			chunk.type === 'chunk' &&
			chunk.isEntry &&
			chunk.facadeModuleId &&
			normalizePath(chunk.facadeModuleId) === resolution.normalizedId,
	);

	assert(
		chunk,
		`Cannot find entry for ${JSON.stringify(resolution.normalizedId)}`,
	);

	return chunk;
}

async function resolveAndEmit(
	context: Rollup.PluginContext,
	destination: string,
	source: string,
	transformer: (
		text: string,
		resolution: Awaited<ReturnType<typeof resolveAndNormalize>>,
	) => string | Promise<string> = (text) => text,
) {
	const resolution = await resolveAndNormalize(context, source);
	const string = await readFile(resolution.id, 'utf8');

	return context.emitFile({
		type: 'asset',
		originalFileName: resolution.id,
		fileName: destination,
		source: await transformer(string, resolution),
	});
}

export function vscode<T extends VsCodePackageJson = VsCodePackageJson>({
	packageJsonTransformers = [],
	copyPaths = {},
}: ViteVsCodeOptions<T> = {}): Plugin {
	return {
		name: 'vscode',
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
							...builtinModules,
							...builtinModules.map((i) => `node:${i}`),
						],
					},
					sourcemap: env.mode !== 'production',
					minify: env.mode === 'production',
				},
			};
		},
		async generateBundle(options, bundle) {
			const entryResolution = await resolveAndNormalize(this, '.');
			const entryChunk = findChunkForId(bundle, entryResolution);

			await resolveAndEmit(
				this,
				'package.json',
				'./package.json',
				async (text) => {
					let packageJson = JSON.parse(text) as T;
					packageJson.main = entryChunk.fileName;

					for (const f of packageJsonTransformers) {
						packageJson = (await f(packageJson)) ?? packageJson;
					}

					return JSON.stringify(packageJson, undefined, '\t');
				},
			);

			for (const [destination, source] of Object.entries(copyPaths)) {
				await resolveAndEmit(this, destination, source);
			}
		},
	};
}
