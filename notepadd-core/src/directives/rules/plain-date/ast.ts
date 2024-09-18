import type {Temporal} from 'temporal-polyfill';
import {SyntaxNode} from '../ast.ts';

export type PlainDateChildNode = {
	toPlainDate(today: Temporal.PlainDate): Temporal.PlainDate;
};

export class PlainDateNode extends SyntaxNode<[PlainDateChildNode]> {
	readonly date = this._children[0];

	toPlainDate(today: Temporal.PlainDate) {
		return this.date.toPlainDate(today);
	}
}
