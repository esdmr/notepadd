import type {MooToken} from '@esdmr/nearley';
import type {Temporal} from 'temporal-polyfill';
import {SyntaxNode} from '../../ast.ts';
import type {TimeZoneNode} from '../../time-zone/ast.ts';

export class InstantNowNode extends SyntaxNode<
	[MooToken, TimeZoneNode | undefined]
> {
	readonly timeZone = this._children[1];

	toInstant(now: Temporal.ZonedDateTime): Temporal.ZonedDateTime {
		if (this.timeZone) {
			now = now.withTimeZone(this.timeZone.toTimeZone());
		}

		return now;
	}
}
