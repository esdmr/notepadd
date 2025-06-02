import {defineConfig} from 'vite';
import inspect from 'vite-plugin-inspect';
import {viteStaticCopy} from 'vite-plugin-static-copy';
import {childProcess} from 'vite-plugin-child-process';
import {
	packageJson,
	transformBuiltPackageJson,
	transformPackageJson,
} from 'vite-plugin-package-json';
import {subvite} from 'vite-plugin-subvite';
import {vscode} from 'vite-plugin-vscode';

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
		childProcess(),
		packageJson(),
		transformPackageJson((json) => {
			delete json.private;
			delete json.type;
			delete json.scripts;
			delete json.packageManager;
			delete json.devDependencies;
		}),
		transformBuiltPackageJson((json) => {
			delete json.dependencies;
		}),
		subvite(),
		vscode(),
		viteStaticCopy({
			targets: [
				{src: '../README.md', dest: '.', overwrite: true},
				{src: '../LICENSE.txt', dest: '.', overwrite: true},
			],
		}),
	],
}));
