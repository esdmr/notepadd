import type {MooToken} from '@esdmr/nearley';
import {SyntaxNode} from '../../ast.ts';
import type {TimeZoneChildNode} from '../ast.ts';

export class TimeZoneIdentifierNode
	extends SyntaxNode<[MooToken]>
	implements TimeZoneChildNode
{
	readonly timeZoneIdentifier = this._children[0].value;

	toTimeZone() {
		return this.timeZoneIdentifier;
	}
}
