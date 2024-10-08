import {Temporal} from 'temporal-polyfill';
import {SyntaxNode} from '../ast.ts';
import {Directive} from './types.ts';
import {type DirectiveChild} from './base.ts';

export type DirectiveChildNode = {
	toDirective(now: Temporal.ZonedDateTime): DirectiveChild;
};

export class DirectiveNode extends SyntaxNode<[DirectiveChildNode]> {
	readonly directive = this._children[0];

	toDirective(now = Temporal.Now.zonedDateTime('iso8601')) {
		// TODO: Make time-zone configurable.

		return new Directive(this.directive.toDirective(now));
	}
}
