import type {Temporal} from 'temporal-polyfill';
import {SyntaxNode} from '../ast.ts';

export type InstantChildNode = {
	toInstant(now: Temporal.ZonedDateTime): Temporal.ZonedDateTime;
};

export class InstantNode extends SyntaxNode<[InstantChildNode]> {
	readonly instant = this._children[0];

	toInstant(now: Temporal.ZonedDateTime) {
		return this.instant.toInstant(now);
	}
}
