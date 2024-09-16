import type {MooToken} from '@esdmr/nearley';
import {Temporal} from 'temporal-polyfill';
import {
	Directive,
	OneShotAlarm,
	OneShotEvent,
	Period,
	RecurringAlarm,
	RecurringEvent,
	RecurringInstant,
	RecurringPeriod,
	RelativeAlarm,
	Timer,
} from './types.ts';

export abstract class SyntaxNode<Children extends readonly any[]> {
	private declare readonly _brand: 'SyntaxNode';
	constructor(protected readonly _children: Children) {}

	// eslint-disable-next-line @typescript-eslint/naming-convention
	toJSON() {
		return {
			_type: this.constructor.name,
			...this,
			_children: undefined,
		};
	}
}

export type ChildNodesOf<T extends SyntaxNode<any>> =
	T extends SyntaxNode<infer T> ? T : never;

export function createPostProcess<Node extends SyntaxNode<any>>(
	Class: new (argument: ChildNodesOf<Node>) => Node,
) {
	return (argument: readonly [...ChildNodesOf<Node>, ...any[]]) =>
		new Class(argument as unknown as ChildNodesOf<Node>);
}

export class DirectiveNode extends SyntaxNode<
	[AlarmNode | TimerNode | EventNode]
> {
	readonly directive = this._children[0];

	toDirective(now = Temporal.Now.zonedDateTime('iso8601'), showAst = false) {
		// TODO: Make timezone configurable.

		return new Directive(
			this.directive.toDirective(now),
			showAst ? this : undefined,
		);
	}
}

export class AlarmNode extends SyntaxNode<
	[
		MooToken,
		InstantRecurringNode | InstantNode | DurationNode,
		CommentNode | undefined,
	]
> {
	readonly when = this._children[1];
	readonly comment = this._children[2];

	toDirective(now: Temporal.ZonedDateTime) {
		const comment = this.comment?.toArray() ?? [];

		if (this.when instanceof InstantRecurringNode) {
			return new RecurringAlarm(
				this.when.toRecurringInstant(now),
				comment,
			);
		}

		if (this.when instanceof InstantNode) {
			return new OneShotAlarm(this.when.toZonedDateTime(now), comment);
		}

		if (this.when instanceof DurationNode) {
			return new RelativeAlarm(this.when.toDuration(), comment);
		}

		throw new TypeError(
			`Bug: Unhandled alarm kind: [${typeof this.when} ${new Object(this.when).constructor.name}] ${String(this.when)}`,
		);
	}
}

export class TimerNode extends SyntaxNode<
	[MooToken, DurationNode, CommentNode | undefined]
> {
	readonly when = this._children[1];
	readonly comment = this._children[2];

	toDirective(_now: Temporal.ZonedDateTime) {
		return new Timer(this.when.toDuration(), this.comment?.toArray() ?? []);
	}
}

export class EventNode extends SyntaxNode<
	[MooToken, PeriodRecurringNode | PeriodNode, CommentNode | undefined]
> {
	readonly when = this._children[1];
	readonly comment = this._children[2];

	toDirective(now: Temporal.ZonedDateTime) {
		const comment = this.comment?.toArray() ?? [];

		if (this.when instanceof PeriodRecurringNode) {
			return new RecurringEvent(
				this.when.toRecurringPeriod(now),
				comment,
			);
		}

		if (this.when instanceof PeriodNode) {
			return new OneShotEvent(this.when.toPeriod(now), comment);
		}

		throw new TypeError(
			`Bug: Unhandled event kind: [${typeof this.when} ${new Object(this.when).constructor.name}] ${String(this.when)}`,
		);
	}
}

export class PeriodRecurringNode extends SyntaxNode<
	[PeriodNode, MooToken, DurationNode, InstantNode | undefined]
> {
	readonly first = this._children[0];
	readonly interval = this._children[2];
	readonly end = this._children[3];

	toRecurringPeriod(now: Temporal.ZonedDateTime) {
		return new RecurringPeriod(
			this.first?.toPeriod(now),
			this.interval.toDuration(),
			this.end?.toZonedDateTime(now),
		);
	}
}

export class PeriodNode extends SyntaxNode<
	[PeriodWithDurationNode | PeriodWithEndNode | PeriodWholeDayNode]
> {
	readonly period = this._children[0];

	toPeriod(now: Temporal.ZonedDateTime): Period {
		return this.period.toPeriod(now);
	}
}

export class PeriodWithDurationNode extends SyntaxNode<
	[InstantNode, MooToken, DurationNode]
> {
	readonly start = this._children[0];
	readonly duration = this._children[2];

	toPeriod(now: Temporal.ZonedDateTime) {
		return new Period(
			this.start.toZonedDateTime(now),
			Temporal.Duration.from({days: 1}),
		);
	}
}

export class PeriodWithEndNode extends SyntaxNode<
	[InstantNode, MooToken, InstantNode]
> {
	readonly start = this._children[0];
	readonly end = this._children[2];

	toPeriod(now: Temporal.ZonedDateTime) {
		return new Period(
			this.start.toZonedDateTime(now),
			this.end.toZonedDateTime(now),
		);
	}
}

export class PeriodWholeDayNode extends SyntaxNode<
	[PlainDateNode, MooToken, MooToken, TimeZoneNode | undefined]
> {
	readonly date = this._children[0];
	readonly timeZone = this._children[3];

	toPeriod(now: Temporal.ZonedDateTime) {
		return new Period(
			this.date
				.toPlainDate(now.toPlainDate())
				.toZonedDateTime(this.timeZone?.toTimeZone() ?? now.timeZoneId),
			Temporal.Duration.from({days: 1}),
		);
	}
}

export class InstantRecurringNode extends SyntaxNode<
	[InstantNode | undefined, MooToken, DurationNode, InstantNode | undefined]
> {
	readonly first = this._children[0];
	readonly interval = this._children[2];
	readonly end = this._children[3];

	toRecurringInstant(now: Temporal.ZonedDateTime) {
		const duration = this.interval.toDuration();

		return new RecurringInstant(
			this.first?.toZonedDateTime(now) ?? now.add(duration),
			duration,
			this.end?.toZonedDateTime(now),
		);
	}
}

export class InstantNode extends SyntaxNode<
	[InstantLiteralNode | InstantLaterNode | InstantNowNode]
> {
	readonly instant = this._children[0];

	toZonedDateTime(now: Temporal.ZonedDateTime) {
		return this.instant.toZonedDateTime(now);
	}
}

export class InstantLiteralNode extends SyntaxNode<
	[PlainDateNode, PlainTimeNode, TimeZoneNode | undefined]
> {
	readonly date = this._children[0];
	readonly time = this._children[1];
	readonly timeZone = this._children[2];

	toZonedDateTime(now: Temporal.ZonedDateTime) {
		return this.date.toPlainDate(now.toPlainDate()).toZonedDateTime({
			plainTime: this.time.toPlainTime(now.toPlainTime()),
			timeZone: this.timeZone?.toTimeZone() ?? now.timeZoneId,
		});
	}
}

export class InstantLaterNode extends SyntaxNode<
	[PlainTimeNode, TimeZoneNode | undefined]
> {
	readonly time = this._children[0];
	readonly timeZone = this._children[1];

	toZonedDateTime(now: Temporal.ZonedDateTime) {
		if (this.timeZone) {
			now = now.withTimeZone(this.timeZone.toTimeZone());
		}

		let later = now.withPlainTime(this.time.toPlainTime(now.toPlainTime()));

		if (Temporal.ZonedDateTime.compare(later, now) < 0) {
			later = later.add({days: 1});
		}

		if (Temporal.ZonedDateTime.compare(later, now) < 0) {
			throw new Error(
				'Bug: Cannot find the given time within the next 24 hours',
			);
		}

		return later;
	}
}

export class InstantNowNode extends SyntaxNode<
	[MooToken, TimeZoneNode | undefined]
> {
	readonly timeZone = this._children[1];

	toZonedDateTime(now: Temporal.ZonedDateTime) {
		if (this.timeZone) {
			now = now.withTimeZone(this.timeZone.toTimeZone());
		}

		return now;
	}
}

export class PlainDateNode extends SyntaxNode<
	[PlainDateLiteralNode | PlainDateKeywordNode]
> {
	readonly date = this._children[0];

	toPlainDate(today: Temporal.PlainDate) {
		return this.date.toPlainDate(today);
	}
}

export class PlainDateLiteralNode extends SyntaxNode<
	[
		CalendarNode | undefined,
		UnsignedIntegerNode,
		MooToken,
		UnsignedIntegerNode,
		MooToken,
		UnsignedIntegerNode,
	]
> {
	readonly calendar = this._children[0];
	readonly year = this._children[1];
	readonly month = this._children[3];
	readonly day = this._children[5];

	toPlainDate(_today: Temporal.PlainDate) {
		// TODO: Make configurable.
		return Temporal.PlainDate.from({
			calendar: this.calendar?.calendar,
			year: this.year.toNumber(),
			month: this.month.toNumber(),
			day: this.day.toNumber(),
		});
	}
}

export class PlainDateKeywordNode extends SyntaxNode<[MooToken]> {
	readonly keyword = this._children[0].type;

	toPlainDate(today: Temporal.PlainDate) {
		switch (this.keyword) {
			case 'today': {
				return today;
			}

			case 'tomorrow': {
				return today.add({days: 1});
			}

			default: {
				throw new Error(
					`Bug: Unhandled date keyword: ${this.keyword}, ${this._children[0].value}`,
				);
			}
		}
	}
}

export class CalendarNode extends SyntaxNode<[MooToken, readonly MooToken[]]> {
	// TODO: Make configurable.
	readonly calendar = this._children
		.flat()
		.map((i) => i.value)
		.join('-');
}

export class PlainTimeNode extends SyntaxNode<
	[PlainTimeLiteralNode | PlainTimeOfDayNode | PlainTimeNowNode]
> {
	readonly time = this._children[0];

	toPlainTime(now: Temporal.PlainTime) {
		return this.time.toPlainTime(now);
	}
}

export class PlainTimeLiteralNode extends SyntaxNode<
	[UnsignedIntegerNode, MooToken, UnsignedIntegerNode]
> {
	readonly hour = this._children[0];
	readonly minute = this._children[2];

	toPlainTime(_now: Temporal.PlainTime) {
		return new Temporal.PlainTime(
			this.hour.toNumber(),
			this.minute.toNumber(),
		);
	}
}

export class PlainTimeOfDayNode extends SyntaxNode<[MooToken]> {
	readonly timeOfDay = this._children[0].type;

	toPlainTime(_now: Temporal.PlainTime) {
		// TODO: Make configurable.
		switch (this.timeOfDay) {
			case 'midnight': {
				return new Temporal.PlainTime(0);
			}

			case 'morning': {
				return new Temporal.PlainTime(8);
			}

			case 'noon': {
				return new Temporal.PlainTime(12);
			}

			case 'afternoon': {
				return new Temporal.PlainTime(13);
			}

			case 'evening': {
				return new Temporal.PlainTime(18);
			}

			default: {
				throw new Error(
					`Bug: Unhandled time of day: ${this.timeOfDay}, ${this._children[0].value}`,
				);
			}
		}
	}
}

export class PlainTimeNowNode extends SyntaxNode<[MooToken, MooToken]> {
	toPlainTime(now: Temporal.PlainTime) {
		return now;
	}
}

export class TimeZoneNode extends SyntaxNode<
	[TimeZoneIdentifierNode | OffsetNode]
> {
	readonly timeZone = this._children[0];

	toTimeZone() {
		return this.timeZone.toTimeZone();
	}
}

export class TimeZoneIdentifierNode extends SyntaxNode<[MooToken]> {
	readonly timeZoneIdentifier = this._children[0].value;

	toTimeZone() {
		return this.timeZoneIdentifier;
	}
}

export class OffsetNode extends SyntaxNode<[OffsetLocalNode | OffsetUtcNode]> {
	readonly offset = this._children[0];

	toTimeZone() {
		return this.offset.toTimeZone();
	}
}

export class OffsetLocalNode extends SyntaxNode<
	[NumberSignNode, UnsignedIntegerNode, MooToken, UnsignedIntegerNode]
> {
	readonly sign = this._children[0];
	readonly hours = this._children[1];
	readonly minutes = this._children[3];

	toTimeZone() {
		const hours = this.hours.toString().padStart(2, '0');
		const minutes = this.minutes.toString().padStart(2, '0');
		return `${this.sign.negative ? '-' : '+'}${hours}:${minutes}`;
	}
}

export class OffsetUtcNode extends SyntaxNode<[MooToken]> {
	toTimeZone() {
		return 'UTC';
	}
}

export class DurationNode extends SyntaxNode<
	[[DurationDateNode | undefined, DurationTimeNode | undefined]]
> {
	readonly date = this._children[0][0];
	readonly time = this._children[0][1];

	toDuration() {
		return Temporal.Duration.from({
			years: this.date?.years?.toNumber(),
			months: this.date?.months?.toNumber(),
			days: this.date?.days?.toNumber(),
			hours: this.time?.hours?.toNumber(),
			minutes: this.time?.minutes?.toNumber(),
			seconds: this.time?.seconds?.toNumber(),
		});
	}
}

export class DurationDateNode extends SyntaxNode<
	[
		[
			SignedIntegerNode | undefined,
			SignedIntegerNode | undefined,
			SignedIntegerNode | undefined,
		],
	]
> {
	readonly years = this._children[0][0];
	readonly months = this._children[0][1];
	readonly days = this._children[0][2];
}

export class DurationTimeNode extends SyntaxNode<
	[
		[
			SignedIntegerNode | undefined,
			SignedIntegerNode | undefined,
			SignedIntegerNode | undefined,
		],
	]
> {
	readonly hours = this._children[0][0];
	readonly minutes = this._children[0][1];
	readonly seconds = this._children[0][2];
}

export class SignedIntegerNode extends SyntaxNode<
	[NumberSignNode | undefined, UnsignedIntegerNode]
> {
	readonly sign = this._children[0];
	readonly magnitude = this._children[1];

	toBigInt() {
		const magnitude = this.magnitude.toBigInt();
		return this.sign?.negative ? -magnitude : magnitude;
	}

	toNumber() {
		return Number(this.toBigInt());
	}

	override toString() {
		return this.toBigInt().toString();
	}
}

export class NumberSignNode extends SyntaxNode<[MooToken]> {
	readonly negative = this._children[0].value === '-';
}

export class UnsignedIntegerNode extends SyntaxNode<[MooToken]> {
	readonly value = this._children[0].value;

	toBigInt() {
		return BigInt(this.value);
	}

	toNumber() {
		return Number(this.toBigInt());
	}

	override toString() {
		return this.toBigInt().toString();
	}
}

export class CommentNode extends SyntaxNode<[CommentLineNode[]]> {
	readonly lines = this._children[0];

	toArray() {
		return this.lines.map((i) => i.text);
	}
}

export class CommentLineNode extends SyntaxNode<[MooToken]> {
	readonly text = this._children[0].value;
}
