import assert from 'node:assert';
import {readFile} from 'node:fs/promises';
import {builtinModules} from 'node:module';
import type {PackageJson} from 'type-fest';
import {normalizePath, type Plugin, type Rollup} from 'vite';
import {
	getPackageJsonApi,
	findChunksForId,
	packageJsonHooksBrand,
	type ProvidesPackageJsonHooks,
	type PackageJsonApi,
} from 'vite-plugin-package-json';
import type {ExtensionManifest, ThemePath} from './types.ts';

type View = NonNullable<
	NonNullable<
		NonNullable<ExtensionManifest['contributes']>['views']
	>['explorer']
>[number];

type ParsedIcon =
	| {type: 'alias'; name: string}
	| {type: 'path'; sourcePath: string; buildPath: string}
	| {
			type: 'themed';
			sourcePaths: {light: string; dark: string};
			buildPaths: {light: string; dark: string};
	  };

export type VsCodePackageJson = PackageJson &
	ExtensionManifest & {
		icons?: Record<string, string | ThemePath>;
		extensionName?: string;
	};

async function resolveAndEmit(
	context: Rollup.PluginContext,
	destination: string,
	source: string,
	transformer: (
		text: string,
		resolution: Rollup.ResolvedId,
	) => string | Promise<string> = (text) => text,
): Promise<string> {
	const resolution = await context.resolve(source);
	assert.ok(resolution, `Could not resolve ${JSON.stringify(source)}`);

	const string = await readFile(normalizePath(resolution.id), 'utf8');

	return context.emitFile({
		type: 'asset',
		originalFileName: resolution.id,
		fileName: destination,
		source: await transformer(string, resolution),
	});
}

function parseIcon(icon: string | ThemePath, name = ''): ParsedIcon {
	if (typeof icon === 'string') {
		const match = /^\$\((.*)\)$/.exec(icon);

		return match
			? ({type: 'alias', name: match[1]!} as const)
			: ({
					type: 'path',
					sourcePath: icon,
					buildPath: `icon.${name}.svg`,
				} as const);
	}

	assert.ok(
		icon.light && icon.dark,
		`Icon ${JSON.stringify(name)} does not have both a light and a dark theme`,
	);

	return {
		type: 'themed',
		sourcePaths: {
			light: icon.light,
			dark: icon.dark,
		},
		buildPaths: {
			light: `icon.${name}.light.svg`,
			dark: `icon.${name}.dark.svg`,
		},
	} as const;
}

function getIcon(
	reference: string | ThemePath,
	icons: VsCodePackageJson['icons'] = {},
): ParsedIcon {
	const parsedReference = parseIcon(reference);

	assert.ok(
		parsedReference.type === 'alias',
		`Reference ${JSON.stringify(reference)} does not match "$(...)"`,
	);

	const icon = icons[parsedReference.name];

	return icon ? parseIcon(icon, parsedReference.name) : parsedReference;
}

async function extractIcons(
	context: Rollup.PluginContext,
	icons: VsCodePackageJson['icons'] = {},
): Promise<void> {
	for (const name of Object.keys(icons)) {
		const icon = getIcon(`$(${name})`, icons);

		switch (icon.type) {
			case 'alias': {
				assert.ok(
					!(icon.name in icons),
					`Icon ${JSON.stringify(name)} refers to another icon ${JSON.stringify(icon.name)} which is also defined`,
				);
				break;
			}

			case 'path': {
				assert.ok(
					icon.sourcePath.endsWith('.svg'),
					`Non-SVG icon ${JSON.stringify(name)} is defined`,
				);

				await resolveAndEmit(context, icon.buildPath, icon.sourcePath);

				break;
			}

			case 'themed': {
				assert.ok(
					icon.sourcePaths.light.endsWith('.svg') &&
						icon.sourcePaths.dark.endsWith('.svg'),
					`Non-SVG dark icon ${JSON.stringify(name)} is defined`,
				);

				await resolveAndEmit(
					context,
					icon.buildPaths.light,
					icon.sourcePaths.light,
				);

				await resolveAndEmit(
					context,
					icon.buildPaths.dark,
					icon.sourcePaths.dark,
				);

				break;
			}
		}
	}
}

async function fixIcons(
	contributes: VsCodePackageJson['contributes'] = {},
	icons: VsCodePackageJson['icons'] = {},
): Promise<void> {
	for (const viewContainer of new Set(
		[
			contributes.viewsContainers?.activitybar ?? [],
			contributes.viewsContainers?.panel ?? [],
		].flat(),
	)) {
		const icon = getIcon(viewContainer.icon, icons);

		assert.ok(
			icon.type === 'path',
			`View container ${JSON.stringify(viewContainer.id)} refers to an icon which does not have a theme-independent path`,
		);

		viewContainer.icon = icon.buildPath;
	}

	for (const views of Object.values<View[]>(
		(contributes.views as Record<string, View[]>) ?? {},
	)) {
		for (const view of views) {
			if (!view.icon) continue;
			const icon = getIcon(view.icon, icons);

			assert.ok(
				icon.type === 'path',
				`View ${JSON.stringify(view.id)} refers to an icon which does not have a theme-independent path`,
			);

			view.icon = icon.buildPath;
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
				command.icon = icon.buildPath;
				break;
			}

			case 'themed': {
				command.icon = icon.buildPaths;
				break;
			}
		}
	}
}

export function vscode(): Plugin {
	let packageJson: PackageJsonApi<VsCodePackageJson>;
	let iconsExtracted = false;

	return {
		name: 'vscode',
		api: {
			[packageJsonHooksBrand]: {
				async transformInput(json) {
					if (json.extensionName) {
						json.name = json.extensionName;
						delete json.extensionName;
					}

					if (!iconsExtracted) {
						await extractIcons(this, json.icons);
						iconsExtracted = true;
					}

					await fixIcons(json.contributes, json.icons);
					delete json.icons;
				},
				async transformOutput(json, bundle) {
					const [entryChunk] = await findChunksForId(
						this,
						bundle,
						'.',
					);
					json.main = entryChunk.fileName;
				},
			},
		} satisfies ProvidesPackageJsonHooks<VsCodePackageJson>,
		config(config, env) {
			return {
				resolve: {
					mainFields: ['module', 'jsnext:main', 'jsnext'],
					conditions: ['node'],
				},
				build: {
					target: ['node20', 'chrome122'],
					lib: {
						entry: ['.'],
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
		configResolved({plugins}) {
			packageJson = getPackageJsonApi(plugins);
		},
		buildStart() {
			iconsExtracted = false;
		},
		async resolveId(source) {
			if (source.startsWith('icon:')) {
				return '\0' + source;
			}
		},
		async load(id, options) {
			if (id.startsWith('\0icon:')) {
				const iconName = id.slice(6);
				const json = await packageJson.getInputPackageJson(this);
				const icon = getIcon(`$(${iconName})`, json.icons);

				switch (icon.type) {
					case 'alias': {
						return `import {ThemeIcon} from 'vscode';\nexport default new ThemeIcon(${JSON.stringify(icon.name)});`;
					}

					case 'path': {
						return `export default ${JSON.stringify(icon.buildPath)};`;
					}

					case 'themed': {
						return `export default ${JSON.stringify(icon.buildPaths)};`;
					}
				}
			}
		},
	};
}
