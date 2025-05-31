import {Parser} from '@esdmr/nearley';
import type {Node} from '@esdmr/nearley/compiler/ast';
import {compile} from '@esdmr/nearley/compiler/compile';
import {generate} from '@esdmr/nearley/compiler/generate';
import bootstrap from '@esdmr/nearley/compiler/nearley-language-bootstrapped';
import {
	createFilter,
	type FilterPattern,
	type Plugin,
	transformWithEsbuild,
} from 'vite';

export type ViteNearleyOptions = {
	readonly include?: FilterPattern;
	readonly exclude?: FilterPattern;
	readonly optimize?: boolean;
	readonly extension?: string;
};

export function nearley({
	include,
	exclude,
	optimize,
	extension = '.mjs',
}: ViteNearleyOptions = {}): Plugin {
	const filter = createFilter(include ?? /\.ne$/, exclude);

	return {
		name: 'nearley',
		async transform(code, id, options) {
			if (!filter(id)) return;

			const parser = new Parser(bootstrap);
			parser.feed(code);
			parser.feed('\n');

			const c = compile(parser.results[0] as Node[], {
				args: [id],
				version: '',
				out: false,
				nojs: undefined,
				optimize: optimize ? true : undefined,
				quiet: true,
			});

			for (const file of c.alreadyCompiled) {
				this.addWatchFile(file);
			}

			return transformWithEsbuild(
				Array.from(generate(c), (i) => `${i}\n`).join(''),
				id + extension,
				{sourcemap: false},
			);
		},
	};
}
