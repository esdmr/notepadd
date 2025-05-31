import {defineConfig} from 'vite';
import inspect from 'vite-plugin-inspect';
import {nearley} from 'vite-plugin-nearley';
import {
	findChunksForId,
	packageJson,
	transformBuiltPackageJson,
	transformPackageJson,
} from 'vite-plugin-package-json';
import {viteStaticCopy} from 'vite-plugin-static-copy';

export default defineConfig((env) => ({
	cacheDir: 'node_modules/.cache/vite',
	build: {
		outDir: 'build',
		target: ['node20', 'chrome122', 'firefox122'],
		lib: {
			entry: '.',
			fileName: 'index',
			formats: ['es'],
		},
		rollupOptions: {
			external: /^(?!\.{0,2}\/)/,
		},
		sourcemap: env.mode !== 'production',
		minify: false,
	},
	plugins: [
		inspect({
			build: true,
			outputDir: 'node_modules/.cache/vite-inspect',
		}),
		nearley({
			extension: '.ts',
		}),
		packageJson(),
		transformPackageJson((json) => {
			delete json.private;
			delete json.scripts;
			delete json.packageManager;
			delete json.dependencies;
			delete json.optionalDependencies;
			delete json.devDependencies;
			delete json.devDependenciesMeta;
		}),
		transformBuiltPackageJson(async function (json, bundle) {
			const [entryChunk] = await findChunksForId(this, bundle, '/');

			json.exports = {
				/* eslint-disable @typescript-eslint/naming-convention */
				'.': './' + entryChunk.fileName,
				'./package.json': './package.json',
				/* eslint-enable @typescript-eslint/naming-convention */
			};
		}),
		viteStaticCopy({
			targets: [
				{src: '../README.md', dest: '.', overwrite: true},
				{src: '../LICENSE.txt', dest: '.', overwrite: true},
			],
		}),
	],
}));
