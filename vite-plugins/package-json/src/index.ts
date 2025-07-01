import assert from 'node:assert';
import {readFile} from 'node:fs/promises';
import type {PackageJson} from 'type-fest';
import {normalizePath, type Plugin, type Rollup} from 'vite';

export const packageJsonHooksBrand = Symbol('vite-plugin-package-json hooks');

export type InputPackageJsonTransformer<T extends PackageJson = PackageJson> = (
	this: Rollup.PluginContext,
	json: T,
) => T | void | Promise<T | void>;

export type OutputPackageJsonTransformer<T extends PackageJson = PackageJson> =
	(
		this: Rollup.PluginContext,
		json: T,
		bundle: Rollup.OutputBundle,
	) => T | void | Promise<T | void>;

export type PackageJsonHooks<T extends PackageJson = PackageJson> = {
	transformInput?: InputPackageJsonTransformer<T>;
	transformOutput?: OutputPackageJsonTransformer<T>;
};

export type ProvidesPackageJsonHooks<T extends PackageJson = PackageJson> = {
	[packageJsonHooksBrand]: PackageJsonHooks<T>;
};

export type PackageJsonApi<T extends PackageJson = PackageJson> = {
	getInputPackageJson(context: Rollup.PluginContext): Promise<T>;
};

export const packageJsonApiBrand = Symbol('vite-plugin-package-json api');

export type ProvidesPackageJsonApi<T extends PackageJson = PackageJson> = {
	[packageJsonApiBrand]: PackageJsonApi<T>;
};

export function getPackageJsonApi<T extends PackageJson = PackageJson>(
	plugins: readonly Rollup.Plugin[],
): PackageJsonApi<T> {
	const plugin = plugins.find(
		(i) =>
			typeof i.api === 'object' && i.api && packageJsonApiBrand in i.api,
	);

	assert.ok(plugin, 'This plugin depends on the "package-json" plugin');

	return plugin.api[packageJsonApiBrand] as PackageJsonApi<T>;
}

async function loadPackageJson(
	context: Rollup.PluginContext,
): Promise<PackageJson> {
	const resolution = await context.resolve('/package.json');
	assert.ok(resolution, 'Could not resolve package.json');

	const code = await readFile(normalizePath(resolution.id), 'utf8');

	return JSON.parse(code) as PackageJson;
}

async function getInputPackageJson(
	context: Rollup.PluginContext,
	hooks: PackageJsonHooks[],
): Promise<PackageJson> {
	let json = await loadPackageJson(context);

	for (const i of hooks) {
		json = (await i.transformInput?.call(context, json)) ?? json;
	}

	return json;
}

async function getOutputPackageJson(
	context: Rollup.PluginContext,
	hooks: PackageJsonHooks[],
	bundle: Rollup.OutputBundle,
): Promise<PackageJson> {
	let json = await getInputPackageJson(context, hooks);

	for (const i of hooks) {
		json = (await i.transformOutput?.call(context, json, bundle)) ?? json;
	}

	return json;
}

export function packageJson(): Plugin {
	const hooks: PackageJsonHooks[] = [];

	return {
		name: 'package-json',
		api: {
			[packageJsonApiBrand]: {
				async getInputPackageJson(context) {
					return getInputPackageJson(context, hooks);
				},
			},
		} satisfies ProvidesPackageJsonApi,
		configResolved({plugins}) {
			hooks.length = 0;

			for (const i of plugins) {
				if (
					typeof i.api === 'object' &&
					i.api &&
					packageJsonHooksBrand in i.api
				) {
					hooks.push(
						i.api[packageJsonHooksBrand] as PackageJsonHooks,
					);
				}
			}
		},
		async generateBundle(options, bundle) {
			const json = await getOutputPackageJson(this, hooks, bundle);

			this.emitFile({
				type: 'asset',
				originalFileName: 'package.json',
				fileName: 'package.json',
				source: JSON.stringify(json),
			});
		},
	};
}

export function transformPackageJson<T extends PackageJson = PackageJson>(
	hooks: PackageJsonHooks<T> & {name?: string},
): Plugin {
	return {
		name: hooks.name ?? 'transform-package-json',
		api: {
			[packageJsonHooksBrand]: hooks,
		} satisfies ProvidesPackageJsonHooks<T>,
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
