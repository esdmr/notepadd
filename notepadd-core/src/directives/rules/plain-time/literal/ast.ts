import type {MooToken} from '@esdmr/nearley';
import {Temporal} from 'temporal-polyfill';
import {SyntaxNode} from '../../ast.ts';
import type {UnsignedIntegerNode} from '../../integer/unsigned/ast.ts';

export class PlainTimeLiteralNode extends SyntaxNode<
	[UnsignedIntegerNode, MooToken, UnsignedIntegerNode]
> {
	readonly hour = this._children[0];
	readonly minute = this._children[2];

	toPlainTime(_now: Temporal.PlainTime): Temporal.PlainTime {
		return new Temporal.PlainTime(
			this.hour.toNumber(),
			this.minute.toNumber(),
		);
	}
}
