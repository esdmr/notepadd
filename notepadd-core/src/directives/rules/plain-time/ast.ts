import type {Temporal} from 'temporal-polyfill';
import {SyntaxNode} from '../ast.ts';

export type PlainTimeChildNode = {
	toPlainTime(now: Temporal.PlainTime): Temporal.PlainTime;
};

export class PlainTimeNode extends SyntaxNode<[PlainTimeChildNode]> {
	readonly time = this._children[0];

	toPlainTime(now: Temporal.PlainTime) {
		return this.time.toPlainTime(now);
	}
}
