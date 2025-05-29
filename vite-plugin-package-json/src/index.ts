import assert from 'node:assert';
import {readFile} from 'node:fs/promises';
import type {PackageJson} from 'type-fest';
import {normalizePath, type Plugin, type Rollup} from 'vite';

export type PackageJsonTransformer<T extends PackageJson = PackageJson> = (
	json: T,
) => T | void | Promise<T | void>;

const transformedId = '\0package-json:transformed';
const builtId = '\0package-json:built';

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
	return id === builtId;
}

export function packageJson(): Plugin {
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
				const {code} = await this.load({id: transformedId});
				assert('Could not load transformed package.json');

				return code;
			}
		},
		async generateBundle(options, bundle) {
			const {code} = await this.load({id: builtId});
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
	transformer: PackageJsonTransformer<T>,
): Promise<string> {
	const json = JSON.parse(decapsulate(code)) as T;
	const transformed = await transformer(json);

	return encapsulate(JSON.stringify(transformed ?? json, undefined, '\t'));
}

export function transformPackageJson<T extends PackageJson = PackageJson>(
	transformer: PackageJsonTransformer<T>,
	name = 'package-json-transform',
): Plugin {
	return {
		name,
		async transform(code, id, options) {
			if (!isTransformingPackageJson(id)) return;
			return mutatePackageJson(code, transformer);
		},
	};
}

export function transformBuiltPackageJson<T extends PackageJson = PackageJson>(
	transformer: PackageJsonTransformer<T>,
	name = 'package-json-built-transform',
): Plugin {
	return {
		name,
		async transform(code, id, options) {
			if (!isBuildingPackageJson(id)) return;
			return mutatePackageJson(code, transformer);
		},
	};
}
