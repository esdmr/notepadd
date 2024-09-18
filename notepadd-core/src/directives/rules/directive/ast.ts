import {Temporal} from 'temporal-polyfill';
import {SyntaxNode} from '../ast.ts';
import {Directive, type DirectiveChild} from './types.ts';

export type DirectiveChildNode = {
	toDirective(now: Temporal.ZonedDateTime): DirectiveChild;
};

export class DirectiveNode extends SyntaxNode<[DirectiveChildNode]> {
	readonly directive = this._children[0];

	toDirective(now = Temporal.Now.zonedDateTime('iso8601'), showAst = false) {
		// TODO: Make time-zone configurable.

		return new Directive(
			this.directive.toDirective(now),
			showAst ? this : undefined,
		);
	}
}
