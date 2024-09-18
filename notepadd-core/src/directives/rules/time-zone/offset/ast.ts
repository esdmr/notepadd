import type {MooToken} from '@esdmr/nearley';
import {SyntaxNode} from '../../ast.ts';
import type {NumberSignNode} from '../../number-sign/ast.ts';
import type {UnsignedIntegerNode} from '../../integer/unsigned/ast.ts';
import type {TimeZoneChildNode} from '../ast.ts';

export class TimeZoneOffsetNode
	extends SyntaxNode<
		[NumberSignNode, UnsignedIntegerNode, MooToken, UnsignedIntegerNode]
	>
	implements TimeZoneChildNode
{
	readonly sign = this._children[0];
	readonly hours = this._children[1];
	readonly minutes = this._children[3];

	toTimeZone() {
		const hours = this.hours.toString().padStart(2, '0');
		const minutes = this.minutes.toString().padStart(2, '0');
		return `${this.sign.negative ? '-' : '+'}${hours}:${minutes}`;
	}
}
