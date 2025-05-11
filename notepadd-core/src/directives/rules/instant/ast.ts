import type {Temporal} from 'temporal-polyfill';
import {SyntaxNode} from '../ast.ts';
import type {InstantLaterNode} from './later/ast.ts';
import type {InstantLiteralNode} from './literal/ast.ts';
import type {InstantNowNode} from './now/ast.ts';

export type InstantChildNode =
	| InstantLiteralNode
	| InstantLaterNode
	| InstantNowNode;

export class InstantNode extends SyntaxNode<[InstantChildNode]> {
	readonly instant = this._children[0];

	toInstant(now: Temporal.ZonedDateTime) {
		return this.instant.toInstant(now);
	}
}
