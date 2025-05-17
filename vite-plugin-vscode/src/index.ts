import assert from 'node:assert';
import {readFile} from 'node:fs/promises';
import {builtinModules} from 'node:module';
import type {PackageJson} from 'type-fest';
import {normalizePath, type Plugin, type Rollup} from 'vite';
import type {ExtensionManifest} from './types.ts';

type View = NonNullable<
	NonNullable<
		NonNullable<ExtensionManifest['contributes']>['views']
	>['explorer']
>[number];

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

async function extractIcons(
	context: Rollup.PluginContext,
	contributes: NonNullable<VsCodePackageJson['contributes']>,
) {
	for (const viewContainer of new Set(
		[
			contributes.viewsContainers?.activitybar ?? [],
			contributes.viewsContainers?.panel ?? [],
		].flat(),
	)) {
		const fileName = `viewContainer.${viewContainer.id}.svg`;
		await resolveAndEmit(context, fileName, viewContainer.icon);
		viewContainer.icon = fileName;
	}

	for (const views of Object.values<View[]>(
		(contributes.views as Record<string, View[]>) ?? {},
	)) {
		for (const view of views) {
			if (!view.icon) continue;
			const fileName = `view.${view.id}.svg`;
			await resolveAndEmit(context, fileName, view.icon);
			view.icon = fileName;
		}
	}

	for (const command of Array.isArray(contributes.commands)
		? contributes.commands
		: contributes.commands
			? [contributes.commands]
			: []) {
		if (!command.icon) continue;

		if (typeof command.icon === 'string') {
			if (/^\$\(.*\)$/.test(command.icon)) continue;

			const fileName = `command.${command.command}.svg`;
			await resolveAndEmit(context, fileName, command.icon);
			command.icon = fileName;

			continue;
		}

		if (command.icon.light) {
			const fileName = `command.${command.command}.light.svg`;
			await resolveAndEmit(context, fileName, command.icon.light);
			command.icon.light = fileName;
		}

		if (command.icon.dark) {
			const fileName = `command.${command.command}.dark.svg`;
			await resolveAndEmit(context, fileName, command.icon.dark);
			command.icon.dark = fileName;
		}
	}
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
		async resolveId(source) {
			if (source.startsWith('command-icon:')) {
				return '\0' + source;
			}
		},
		async load(id, options) {
			if (id.startsWith('\0command-icon:')) {
				const commandName = id.slice(14);

				const resolution = await resolveAndNormalize(
					this,
					'./package.json',
				);
				const text = await readFile(resolution.id, 'utf8');

				const packageJson = JSON.parse(text) as T;

				assert(
					packageJson.contributes,
					'Extension does not contribute anything',
				);

				const commands = Array.isArray(packageJson.contributes.commands)
					? packageJson.contributes.commands
					: packageJson.contributes.commands
						? [packageJson.contributes.commands]
						: [];

				const command = commands.find((i) => i.command === commandName);

				assert(
					command,
					`Extension does not contribute the command ${JSON.stringify(commandName)}`,
				);

				assert(
					command.icon,
					`Command ${JSON.stringify(commandName)} does not have an icon`,
				);

				if (typeof command.icon === 'string') {
					if (/^\$\(.*\)$/.test(command.icon)) {
						return `import {ThemeIcon} from 'vscode';\nexport default new ThemeIcon(${JSON.stringify(command.icon.slice(2, -1))});`;
					}

					const fileName = `command.${command.command}.svg`;

					return `export default ${JSON.stringify(fileName)};`;
				}

				return `export default ${JSON.stringify({
					light:
						command.icon.light &&
						`command.${command.command}.light.svg`,
					dark:
						command.icon.dark &&
						`command.${command.command}.dark.svg`,
				})};`;
			}
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

					if (packageJson.contributes) {
						await extractIcons(this, packageJson.contributes);
					}

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
