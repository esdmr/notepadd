import {fileURLToPath} from 'node:url';
import {defineConfig} from 'vite';
import inspect from 'vite-plugin-inspect';
import {nearley} from 'vite-plugin-nearley';
import {
	findChunksForId,
	packageJson,
	transformPackageJson,
} from 'vite-plugin-package-json';
import {viteStaticCopy} from 'vite-plugin-static-copy';
import {isSubvite, subvite} from 'vite-plugin-subvite';
import dts from 'vite-plugin-dts';

export default defineConfig((env) => ({
	cacheDir: 'node_modules/.cache/vite',
	build: {
		outDir: 'build',
		target: ['node20', 'chrome122', 'firefox122'],
		lib: {
			entry: ['src/index.ts'],
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
		nearley({
			extension: '.ts',
		}),
		packageJson(),
		transformPackageJson({
			transformInput(json) {
				delete json.private;
				delete json.scripts;
				delete json.packageManager;
				delete json.devDependencies;
			},
			async transformOutput(json, bundle) {
				const [entryChunk] = await findChunksForId(
					this,
					bundle,
					'/src/index.ts',
				);

				json.exports = {
					/* eslint-disable @typescript-eslint/naming-convention */
					'.': {
						types: './src/index.d.ts',
						default: './' + entryChunk.fileName,
					},
					'./package.json': './package.json',
					/* eslint-enable @typescript-eslint/naming-convention */
				};
			},
		}),
		subvite({
			alwaysExternalize: true,
		}),
		!isSubvite() &&
			dts({
				root: fileURLToPath(new URL('..', import.meta.url)),
				outDir: fileURLToPath(new URL('build', import.meta.url)),
				entryRoot: fileURLToPath(new URL('.', import.meta.url)),
				include: fileURLToPath(new URL('.', import.meta.url)),
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
