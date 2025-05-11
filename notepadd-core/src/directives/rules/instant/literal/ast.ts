import {type Temporal} from 'temporal-polyfill';
import {SyntaxNode} from '../../ast.ts';
import type {PlainDateNode} from '../../plain-date/ast.ts';
import type {PlainTimeNode} from '../../plain-time/ast.ts';
import type {TimeZoneNode} from '../../time-zone/ast.ts';

export class InstantLiteralNode extends SyntaxNode<
	[PlainDateNode, PlainTimeNode, TimeZoneNode | undefined]
> {
	readonly date = this._children[0];
	readonly time = this._children[1];
	readonly timeZone = this._children[2];

	toInstant(now: Temporal.ZonedDateTime) {
		if (this.timeZone) {
			now = now.withTimeZone(this.timeZone.toTimeZone());
		}

		return this.date.toPlainDate(now.toPlainDate()).toZonedDateTime({
			plainTime: this.time.toPlainTime(now.toPlainTime()),
			timeZone: now.timeZoneId,
		});
	}
}
