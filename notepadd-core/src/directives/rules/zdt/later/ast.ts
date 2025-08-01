import {Temporal} from 'temporal-polyfill';
import {SyntaxNode} from '../../ast.ts';
import type {PlainTimeNode} from '../../plain-time/ast.ts';
import type {TimeZoneNode} from '../../time-zone/ast.ts';

export class ZdtLaterNode extends SyntaxNode<
	[PlainTimeNode, TimeZoneNode | undefined]
> {
	readonly time = this._children[0];
	readonly timeZone = this._children[1];

	toZdt(now: Temporal.ZonedDateTime): Temporal.ZonedDateTime {
		if (this.timeZone) {
			now = now.withTimeZone(this.timeZone.toTimeZone());
		}

		let later = now.withPlainTime(this.time.toPlainTime(now.toPlainTime()));

		if (Temporal.ZonedDateTime.compare(later, now) < 0) {
			later = later.add({days: 1});
		}

		if (Temporal.ZonedDateTime.compare(later, now) < 0) {
			throw new Error(
				`Bug: Cannot find the given time within the next 24 hours (since ${now.toString()}): ${JSON.stringify(this, undefined, 2)}`,
			);
		}

		return later;
	}
}
