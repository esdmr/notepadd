import type {MooToken} from '@esdmr/nearley';
import type {Temporal} from 'temporal-polyfill';
import {SyntaxNode} from '../../ast.ts';

export class PlainTimeNowNode extends SyntaxNode<[MooToken, MooToken]> {
	toPlainTime(now: Temporal.PlainTime) {
		return now;
	}
}
