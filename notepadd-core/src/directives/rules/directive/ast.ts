import {Temporal} from 'temporal-polyfill';
import {SyntaxNode} from '../ast.ts';
import type {CommentNode} from '../comment/ast.ts';
import type {AlarmNode} from './alarm/ast.ts';
import type {EventNode} from './event/ast.ts';
import type {ReferenceNode} from './reference/ast.ts';
import type {TimerNode} from './timer/ast.ts';
import {Directive} from './types.ts';

export type DirectiveChildNode =
	| AlarmNode
	| TimerNode
	| ReferenceNode
	| EventNode;

export class DirectiveNode extends SyntaxNode<
	[DirectiveChildNode, CommentNode | undefined]
> {
	readonly directive = this._children[0];
	readonly comment = this._children[1];

	toDirective(now = Temporal.Now.zonedDateTimeISO()): Directive {
		// TODO: Make time-zone configurable.

		return new Directive(
			this.directive.toDirective(now),
			this.comment?.lines,
		);
	}
}
