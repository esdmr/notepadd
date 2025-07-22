import type {Temporal} from 'temporal-polyfill';
import {SyntaxNode} from '../ast.ts';
import type {ZdtLaterNode} from './later/ast.ts';
import type {ZdtLiteralNode} from './literal/ast.ts';
import type {ZdtNowNode} from './now/ast.ts';

export type ZdtChildNode = ZdtLiteralNode | ZdtLaterNode | ZdtNowNode;

export class ZdtNode extends SyntaxNode<[ZdtChildNode]> {
	readonly zdt = this._children[0];

	toZdt(now: Temporal.ZonedDateTime): Temporal.ZonedDateTime {
		return this.zdt.toZdt(now);
	}
}
