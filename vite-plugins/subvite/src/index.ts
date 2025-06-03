import process from 'node:process';
import path from 'node:path';
import {sendMessage} from 'execa';
import {createFilter, type FilterPattern, type Plugin} from 'vite';
import {getTransformedPackageJson} from 'vite-plugin-package-json';
import {
	isSubvite,
	subviteOutputDirectory,
	type SubviteIpcMessage,
} from './process.ts';
import {dependencyPattern, SubviteRegistry} from './registry.ts';

export {isSubvite} from './process.ts';

export type SubviteOptions = {
	dependencies?: {
		readonly include?: FilterPattern;
		readonly exclude?: FilterPattern;
	};
	alwaysExternalize?: boolean;
};

export function subvite({
	dependencies: {include, exclude} = {},
	alwaysExternalize = false,
}: SubviteOptions = {}): Plugin {
	const filter = createFilter(include, exclude);
	let registry: SubviteRegistry;
	let mode = process.env.NODE_ENV ?? 'production';

	return {
		name: 'subvite',
		config(config, env) {
			if (isSubvite()) {
				config.build ??= {};
				config.build.outDir = subviteOutputDirectory;
			}

			if (alwaysExternalize || isSubvite()) {
				config.build ??= {};
				config.build.rollupOptions ??= {};
				config.build.rollupOptions.external ??= [];

				if (Array.isArray(config.build.rollupOptions.external)) {
					config.build.rollupOptions.external.push(dependencyPattern);
				} else if (
					typeof config.build.rollupOptions.external === 'function'
				) {
					const oldHandler = config.build.rollupOptions.external;

					config.build.rollupOptions.external = (source, ...rest) =>
						dependencyPattern.test(source) ||
						oldHandler(source, ...rest);
				} else {
					config.build.rollupOptions.external = [
						config.build.rollupOptions.external,
						dependencyPattern,
					];
				}
			}
		},
		configResolved(config) {
			mode = config.mode;

			process.chdir(
				path.resolve(
					config.configFile
						? path.dirname(config.configFile)
						: process.cwd(),
					config.root,
				),
			);
		},
		async buildStart() {
			registry ??= new SubviteRegistry(this, mode, filter);

			if (isSubvite()) {
				await sendMessage({
					_type: 'buildStart',
				} satisfies SubviteIpcMessage);
			}

			const json = await getTransformedPackageJson(this);
			await registry.update(json);
		},
		resolveId: {
			order: 'pre',
			async handler(source, importer, options) {
				return registry.resolveId(source, importer, alwaysExternalize);
			},
		},
		async load(id, options) {
			return registry.load(id, this);
		},
		async closeBundle(error) {
			if (!isSubvite()) return;

			await registry.waitForAllBuilds();

			await sendMessage({
				_type: 'closeBundle',
				error: error?.message,
			} satisfies SubviteIpcMessage);
		},
	};
}
