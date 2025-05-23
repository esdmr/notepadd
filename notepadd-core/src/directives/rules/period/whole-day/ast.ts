import type {MooToken} from '@esdmr/nearley';
import {Temporal} from 'temporal-polyfill';
import {SyntaxNode} from '../../ast.ts';
import type {PlainDateNode} from '../../plain-date/ast.ts';
import type {TimeZoneNode} from '../../time-zone/ast.ts';
import {Period} from '../types.ts';

export class PeriodWholeDayNode extends SyntaxNode<
	[PlainDateNode, MooToken, MooToken, TimeZoneNode | undefined]
> {
	readonly date = this._children[0];
	readonly timeZone = this._children[3];

	toPeriod(now: Temporal.ZonedDateTime): Period {
		return new Period(
			this.date
				.toPlainDate(now.toPlainDate())
				.toZonedDateTime(this.timeZone?.toTimeZone() ?? now.timeZoneId),
			Temporal.Duration.from({days: 1}),
		);
	}
}
