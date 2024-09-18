import type {MooToken} from '@esdmr/nearley';
import type {Temporal} from 'temporal-polyfill';
import {SyntaxNode} from '../../ast.ts';
import type {PlainTimeChildNode} from '../ast.ts';

export class PlainTimeNowNode
	extends SyntaxNode<[MooToken, MooToken]>
	implements PlainTimeChildNode
{
	toPlainTime(now: Temporal.PlainTime) {
		return now;
	}
}
