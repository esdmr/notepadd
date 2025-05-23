import type {MooToken} from '@esdmr/nearley';
import {SyntaxNode} from '../../ast.ts';

export class TimeZoneIdentifierNode extends SyntaxNode<[MooToken]> {
	readonly timeZoneIdentifier = this._children[0].value;

	toTimeZone(): string {
		return this.timeZoneIdentifier;
	}
}
