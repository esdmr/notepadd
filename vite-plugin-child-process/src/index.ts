import assert from 'node:assert';
import {createFilter, type FilterPattern, type Plugin} from 'vite';

export type ViteChildProcessOptions = {
	readonly include?: FilterPattern;
	readonly exclude?: FilterPattern;
	readonly suffix?: string;
};

export function childProcess({
	include = /\.([mc]?[tj]s|[jt]sx)$/,
	exclude,
	suffix = '?child-process',
}: ViteChildProcessOptions = {}): Plugin {
	const filter = createFilter(include, exclude);

	return {
		name: 'child-process',
		enforce: 'pre',
		async resolveId(source, importer, options) {
			if (filter(importer) && source.endsWith(suffix)) {
				const resolved = await this.resolve(
					source.slice(0, -suffix.length),
					importer,
				);

				assert.ok(resolved);
				return '\0' + resolved.id + suffix;
			}
		},
		async load(id, options) {
			if (id.startsWith('\0') && id.endsWith(suffix)) {
				const referenceId = this.emitFile({
					type: 'chunk',
					id: id.slice(1, -suffix.length),
					preserveSignature: 'strict',
				});

				return `export default new URL(import.meta.ROLLUP_FILE_URL_${referenceId});`;
			}
		},
	};
}
