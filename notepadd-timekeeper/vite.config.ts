import {builtinModules} from 'node:module';
import {defineConfig} from 'vite';
import inspect from 'vite-plugin-inspect';
import {
	findChunksForId,
	packageJson,
	transformBuiltPackageJson,
	transformPackageJson,
} from 'vite-plugin-package-json';
import {viteStaticCopy} from 'vite-plugin-static-copy';
import {isSubvite, subvite} from 'vite-plugin-subvite';

export default defineConfig((env) => ({
	cacheDir: 'node_modules/.cache/vite',
	build: {
		outDir: 'build',
		target: ['node20', 'chrome122', 'firefox122'],
		lib: {
			entry: ['.', './src/service.ts'],
			fileName: 'index',
			formats: ['es'],
		},
		sourcemap: env.mode !== 'production',
		minify: false,
	},
	plugins: [
		inspect({
			build: !isSubvite(),
			outputDir: 'node_modules/.cache/vite-inspect',
		}),
		packageJson(),
		transformPackageJson((json) => {
			delete json.private;
			delete json.scripts;
			delete json.packageManager;
			delete json.devDependencies;
		}),
		transformBuiltPackageJson(async function (json, bundle) {
			const [entryChunk] = await findChunksForId(this, bundle, '/');
			const [serviceChunk] = await findChunksForId(
				this,
				bundle,
				'/src/service.ts',
			);

			json.exports = {
				/* eslint-disable @typescript-eslint/naming-convention */
				'.': './' + entryChunk.fileName,
				'./service': './' + serviceChunk.fileName,
				'./package.json': './package.json',
				/* eslint-enable @typescript-eslint/naming-convention */
			};
		}),
		subvite({
			alwaysExternalize: true,
		}),
		!isSubvite() &&
			viteStaticCopy({
				targets: [
					{src: '../README.md', dest: '.', overwrite: true},
					{src: '../LICENSE.txt', dest: '.', overwrite: true},
				],
			}),
	],
}));
