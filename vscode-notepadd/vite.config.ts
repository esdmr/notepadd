import {defineConfig} from 'vite';
import inspect from 'vite-plugin-inspect';
import {vscode} from '../vite-plugin-vscode/src/index.ts';
// Note: Vite does not build files in `node_modules`, so keep the path to
// `vite-plugin-vscode` relative.

export default defineConfig((env) => ({
	cacheDir: 'node_modules/.cache/vite',
	build: {
		outDir: 'build',
	},
	plugins: [
		inspect({
			build: true,
			outputDir: 'node_modules/.cache/vite-inspect',
		}),
		vscode({
			packageJsonTransformers: [
				(json) => {
					delete json.private;
					delete json.type;
					delete json.scripts;
					delete json.packageManager;
					delete json.dependencies;
					delete json.optionalDependencies;
					delete json.devDependencies;
					delete json.devDependenciesMeta;
				},
			],
			copyPaths: ['../README.md', '../LICENSE.txt'],
		}),
	],
}));