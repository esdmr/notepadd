import {Parser} from '@esdmr/nearley';
import grammar from './grammar.ne';
import type {DirectiveNode} from './ast.ts';

export function parseDirective(text: string): DirectiveNode {
	const parser = new Parser(grammar);

	parser.feed(text);
	parser.feed('\n');

	const results = parser.results as DirectiveNode[];

	if (results.length === 0) {
		throw new Error('Failed to parse directives');
	} else if (results.length > 1) {
		throw new Error('Bug: Directives grammar has ambiguities', {
			cause: results,
		});
	}

	return results[0]!;
}
