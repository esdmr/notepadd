import type {Temporal} from 'temporal-polyfill';
import {SyntaxNode} from '../ast.ts';
import type {PlainTimeLiteralNode} from './literal/ast.ts';
import type {PlainTimeNowNode} from './now/ast.ts';
import type {PlainTimeOfDayNode} from './time-of-day/ast.ts';

export type PlainTimeChildNode =
	| PlainTimeLiteralNode
	| PlainTimeNowNode
	| PlainTimeOfDayNode;

export class PlainTimeNode extends SyntaxNode<[PlainTimeChildNode]> {
	readonly time = this._children[0];

	toPlainTime(now: Temporal.PlainTime) {
		return this.time.toPlainTime(now);
	}
}
