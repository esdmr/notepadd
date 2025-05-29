import {defineConfig} from 'vite';
import inspect from 'vite-plugin-inspect';
import {viteStaticCopy} from 'vite-plugin-static-copy';
import {childProcess} from '../vite-plugin-child-process/src/index.ts';
import {nearley} from '../vite-plugin-nearley/src/index.ts';
import {vscode} from '../vite-plugin-vscode/src/index.ts';
import {
	packageJson,
	transformPackageJson,
} from '../vite-plugin-package-json/src/index.ts';
// Note: Vite does not build files in `node_modules`, so keep the path to vite
// plugins relative.

export default defineConfig((env) => ({
	cacheDir: 'node_modules/.cache/vite',
	build: {
		outDir: 'build',
		reportCompressedSize: false,
	},
	plugins: [
		inspect({
			build: true,
			outputDir: 'node_modules/.cache/vite-inspect',
		}),
		nearley({
			extension: '.ts',
		}),
		childProcess(),
		packageJson(),
		transformPackageJson((json) => {
			delete json.private;
			delete json.type;
			delete json.scripts;
			delete json.packageManager;
			delete json.dependencies;
			delete json.optionalDependencies;
			delete json.devDependencies;
			delete json.devDependenciesMeta;
		}),
		vscode(),
		viteStaticCopy({
			targets: [
				{src: '../README.md', dest: '.', overwrite: true},
				{src: '../LICENSE.txt', dest: '.', overwrite: true},
			],
		}),
	],
}));
