import {Parser} from '@esdmr/nearley';
import type {Temporal} from 'temporal-polyfill';
import * as v from 'valibot';
import grammar from './grammar.ne';
import type {DirectiveNode} from './rules/directive/ast.ts';
import {Directive} from './rules/types.ts';

export const directiveMimeType = 'application/x-notepadd+json';

export function parseDirective(
	text: string,
	now?: Temporal.ZonedDateTime,
): {directive: Directive; ast: unknown} {
	const parser = new Parser(grammar);

	parser.feed(text);
	parser.feed('\n');

	const results = parser.results as DirectiveNode[];

	if (results.length === 0) {
		throw new Error('Failed to parse directives');
	} else if (results.length > 1) {
		throw new Error(
			`Bug: Directives grammar has ambiguities: ${JSON.stringify(results, undefined, 2)}`,
		);
	}

	// TODO: replace with just the directive.
	return {
		directive: results[0]!.toDirective(now),
		ast: results[0]! as unknown,
	};
}

export function deserializeDirective(text: string): Directive {
	return v.parse(Directive.schema, JSON.parse(text));
}

export * from './rules/types.ts';
