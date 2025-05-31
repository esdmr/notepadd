import assert from 'node:assert';
import {readFile} from 'node:fs/promises';
import type {PackageJson} from 'type-fest';
import {normalizePath, type Plugin, type Rollup} from 'vite';

export type PackageJsonMutator<T extends PackageJson> = (
	json: T,
) => T | void | Promise<T | void>;

export type PackageJsonTransformer<T extends PackageJson> = (
	this: Rollup.TransformPluginContext,
	json: T,
) => T | void | Promise<T | void>;

export type PackageJsonBuildTransformer<T extends PackageJson> = (
	this: Rollup.TransformPluginContext,
	json: T,
	bundle: Rollup.OutputBundle,
) => T | void | Promise<T | void>;

const transformedId = '\0package-json:transformed';
const builtId = '\0package-json:built?';

function encapsulate(code: string): string {
	return `export default ${JSON.stringify(code)};`;
}

function decapsulate(content: string): string {
	return String(JSON.parse(content.slice(15, -1)));
}

export function isTransformingPackageJson(id: string): boolean {
	return id === transformedId;
}

export function isBuildingPackageJson(id: string): boolean {
	return id.startsWith(builtId);
}

export function packageJson(): Plugin {
	let timesGenerated = 0;

	return {
		name: 'package-json',
		resolveId(source, importer, options) {
			if (
				isTransformingPackageJson(source) ||
				isBuildingPackageJson(source)
			) {
				return source;
			}
		},
		async load(id, options) {
			if (isTransformingPackageJson(id)) {
				const resolution = await this.resolve('package.json');
				assert(resolution, 'Could not resolve package.json');

				const code = await readFile(
					normalizePath(resolution.id),
					'utf8',
				);

				return encapsulate(code);
			}

			if (isBuildingPackageJson(id)) {
				const module = await this.load({id: transformedId});
				assert(module.code, 'Could not load transformed package.json');

				return {
					...module,
					code: module.code,
					ast: undefined,
				};
			}
		},
		async generateBundle(options, bundle) {
			const {code} = await this.load({id: builtId + timesGenerated++});
			assert(code, `Could not load built package.json`);

			this.emitFile({
				type: 'asset',
				originalFileName: 'package.json',
				fileName: 'package.json',
				source: decapsulate(code),
			});
		},
	};
}

export async function getTransformedPackageJson<
	T extends PackageJson = PackageJson,
>(context: Rollup.PluginContext): Promise<T> {
	const {code} = await context.load({id: transformedId});
	assert(code, `Could not load transformed package.json`);
	return JSON.parse(decapsulate(code)) as T;
}

export async function mutatePackageJson<T extends PackageJson = PackageJson>(
	code: string,
	mutator: PackageJsonMutator<T>,
): Promise<string> {
	const json = JSON.parse(decapsulate(code)) as T;
	const mutated = await mutator(json);

	return encapsulate(JSON.stringify(mutated ?? json, undefined, '\t'));
}

export function transformPackageJson<T extends PackageJson = PackageJson>(
	transformer: PackageJsonTransformer<T>,
	name = 'package-json-transform',
): Plugin {
	return {
		name,
		async transform(code, id, options) {
			if (!isTransformingPackageJson(id)) return;
			return mutatePackageJson<T>(code, async (json) =>
				transformer.call(this, json),
			);
		},
	};
}

export function transformBuiltPackageJson<T extends PackageJson = PackageJson>(
	transformer: PackageJsonBuildTransformer<T>,
	name = 'package-json-built-transform',
): Plugin {
	let bundle: Rollup.OutputBundle | undefined;

	return {
		name,
		async transform(code, id, options) {
			if (!isBuildingPackageJson(id)) return;

			assert(
				bundle,
				'Cannot build package.json. Output bundle is not available yet.',
			);

			return mutatePackageJson<T>(code, async (json) =>
				transformer.call(this, json, bundle!),
			);
		},
		generateBundle: {
			order: 'pre',
			handler(options, bundle_, isWrite) {
				bundle = {...bundle, ...bundle_};
			},
		},
	};
}

export async function findChunksForId(
	context: Rollup.PluginContext,
	bundle: Rollup.OutputBundle,
	id: string,
): Promise<
	[Rollup.OutputBundle[string], ...Array<Rollup.OutputBundle[string]>]
> {
	const entryResolution = await context.resolve(id);

	if (!entryResolution) {
		context.error({id, message: 'Resolution failed.'});
	}

	const normalizedId = normalizePath(entryResolution.id);

	const chunk = Object.values(bundle).filter(
		(chunk) =>
			chunk.type === 'chunk' &&
			chunk.isEntry &&
			chunk.facadeModuleId &&
			normalizePath(chunk.facadeModuleId) === normalizedId,
	);

	if (chunk.length === 0) {
		context.error({id, message: 'No associated output chunk found.'});
	}

	return chunk as [
		Rollup.OutputBundle[string],
		...Array<Rollup.OutputBundle[string]>,
	];
}
