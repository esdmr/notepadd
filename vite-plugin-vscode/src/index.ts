import assert from 'node:assert';
import {readFile} from 'node:fs/promises';
import {builtinModules} from 'node:module';
import type {PackageJson} from 'type-fest';
import {normalizePath, type Plugin, type Rollup} from 'vite';
import type {ExtensionManifest, ThemePath} from './types.ts';

type View = NonNullable<
	NonNullable<
		NonNullable<ExtensionManifest['contributes']>['views']
	>['explorer']
>[number];

export type VsCodePackageJson = PackageJson &
	ExtensionManifest & {
		icons?: Record<string, string | ThemePath>;
	};

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

function parseIcon(icon: string | ThemePath, name?: string) {
	if (typeof icon === 'string') {
		const match = /^\$\((.*)\)$/.exec(icon);

		return match
			? ({type: 'alias', name: match[1]!} as const)
			: ({type: 'path', path: icon} as const);
	}

	assert(
		icon.light && icon.dark,
		`Icon ${JSON.stringify(name ?? icon)} does not have both a light and a dark theme`,
	);

	return {
		type: 'themed',
		paths: {
			light: icon.light,
			dark: icon.dark,
		},
	} as const;
}

function getIcon(
	reference: string | ThemePath,
	icons: NonNullable<VsCodePackageJson['icons']>,
) {
	const parsedReference = parseIcon(reference);

	assert(
		parsedReference.type === 'alias',
		`Reference ${JSON.stringify(reference)} does not match "$(...)"`,
	);

	const icon = icons[parsedReference.name];
	if (!icon) return parsedReference;

	const parsed = parseIcon(icon);

	switch (parsed.type) {
		case 'alias': {
			return parsed;
		}

		case 'path': {
			return {
				...parsed,
				path: `icon.${parsedReference.name}.svg`,
				originalPath: parsed.path,
			} as const;
		}

		case 'themed': {
			return {
				type: 'themed',
				paths: {
					light: `icon.${parsedReference.name}.light.svg`,
					dark: `icon.${parsedReference.name}.dark.svg`,
				},
				originalPaths: parsed.paths,
			} as const;
		}
	}
}

async function extractIcons(
	context: Rollup.PluginContext,
	icons: NonNullable<VsCodePackageJson['icons']>,
) {
	for (const name of Object.keys(icons)) {
		const icon = getIcon(`$(${name})`, icons);

		switch (icon.type) {
			case 'alias': {
				assert(
					!(icon.name in icons),
					`Icon ${JSON.stringify(name)} refers to another icon ${JSON.stringify(icon.name)} which is also defined`,
				);
				break;
			}

			case 'path': {
				assert(
					icon.originalPath.endsWith('.svg'),
					`Non-SVG icon ${JSON.stringify(name)} is defined`,
				);

				await resolveAndEmit(context, icon.path, icon.originalPath);

				break;
			}

			case 'themed': {
				assert(
					icon.originalPaths.light.endsWith('.svg') &&
						icon.originalPaths.dark.endsWith('.svg'),
					`Non-SVG dark icon ${JSON.stringify(name)} is defined`,
				);

				await resolveAndEmit(
					context,
					icon.paths.light,
					icon.originalPaths.light,
				);

				await resolveAndEmit(
					context,
					icon.paths.dark,
					icon.originalPaths.dark,
				);

				break;
			}
		}
	}
}

async function fixIcons(
	context: Rollup.PluginContext,
	contributes: NonNullable<VsCodePackageJson['contributes']>,
	icons: NonNullable<VsCodePackageJson['icons']>,
) {
	for (const viewContainer of new Set(
		[
			contributes.viewsContainers?.activitybar ?? [],
			contributes.viewsContainers?.panel ?? [],
		].flat(),
	)) {
		const icon = getIcon(viewContainer.icon, icons);

		assert(
			icon.type === 'path',
			`View container ${JSON.stringify(viewContainer.id)} refers to an icon which does not have a theme-independent path`,
		);

		viewContainer.icon = icon.path;
	}

	for (const views of Object.values<View[]>(
		(contributes.views as Record<string, View[]>) ?? {},
	)) {
		for (const view of views) {
			if (!view.icon) continue;
			const icon = getIcon(view.icon, icons);

			assert(
				icon.type === 'path',
				`View ${JSON.stringify(view.id)} refers to an icon which does not have a theme-independent path`,
			);

			view.icon = icon.path;
		}
	}

	for (const command of Array.isArray(contributes.commands)
		? contributes.commands
		: contributes.commands
			? [contributes.commands]
			: []) {
		if (!command.icon) continue;

		const icon = getIcon(command.icon, icons);

		switch (icon.type) {
			case 'alias': {
				command.icon = `$(${icon.name})`;
				break;
			}

			case 'path': {
				command.icon = icon.path;
				break;
			}

			case 'themed': {
				command.icon = icon.paths;
				break;
			}
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
			if (source.startsWith('icon:')) {
				return '\0' + source;
			}
		},
		async load(id, options) {
			if (id.startsWith('\0icon:')) {
				const iconName = id.slice(6);

				const resolution = await resolveAndNormalize(
					this,
					'./package.json',
				);
				const text = await readFile(resolution.id, 'utf8');

				const packageJson = JSON.parse(text) as T;

				const icon = getIcon(`$(${iconName})`, packageJson.icons ?? {});

				switch (icon.type) {
					case 'alias': {
						return `import {ThemeIcon} from 'vscode';\nexport default new ThemeIcon(${JSON.stringify(icon.name)});`;
					}

					case 'path': {
						return `export default ${JSON.stringify(icon.path)};`;
					}

					case 'themed': {
						return `export default ${JSON.stringify(icon.paths)};`;
					}
				}
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

					const icons = packageJson.icons ?? {};
					delete packageJson.icons;

					await extractIcons(this, icons);
					await fixIcons(this, packageJson.contributes ?? {}, icons);

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
