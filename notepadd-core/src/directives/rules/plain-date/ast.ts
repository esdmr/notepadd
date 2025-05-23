import type {Temporal} from 'temporal-polyfill';
import {SyntaxNode} from '../ast.ts';
import type {PlainDateKeywordNode} from './keyword/ast.ts';
import type {PlainDateLiteralNode} from './literal/ast.ts';

export type PlainDateChildNode = PlainDateKeywordNode | PlainDateLiteralNode;

export class PlainDateNode extends SyntaxNode<[PlainDateChildNode]> {
	readonly date = this._children[0];

	toPlainDate(today: Temporal.PlainDate): Temporal.PlainDate {
		return this.date.toPlainDate(today);
	}
}
