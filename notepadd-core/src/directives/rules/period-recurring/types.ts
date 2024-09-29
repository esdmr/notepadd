import {Temporal} from 'temporal-polyfill';
import type {JsonValue} from 'type-fest';
import {minDuration} from '../../../utils.ts';
import {Period} from '../period/types.ts';
import {RecurringInstant} from '../instant-recurring/types.ts';

export class RecurringPeriod {
	static from(json: JsonValue) {
		if (
			typeof json !== 'object' ||
			!json ||
			!('_type' in json) ||
			json._type !== 'RecurringPeriod' ||
			json.first === undefined ||
			typeof json.interval !== 'string'
		) {
			throw new Error(
				`Cannot deserialize a recurring period from JSON: ${JSON.stringify(json)}`,
			);
		}

		return new RecurringPeriod(
			Period.from(json.first),
			Temporal.Duration.from(json.interval),
			typeof json.end === 'string'
				? Temporal.ZonedDateTime.from(json.end)
				: undefined,
		);
	}

	readonly _type = 'RecurringPeriod';

	constructor(
		readonly first: Period,
		readonly interval: Temporal.Duration,
		readonly end?: Temporal.ZonedDateTime,
	) {
		if (end && Temporal.ZonedDateTime.compare(end, first.start) < 0) {
			throw new RangeError(
				`Recurring period ends (${end.toString()}) before it starts (${first.start.toString()})`,
			);
		}
	}

	toString() {
		return `R/${this.first.toString()}/${this.interval.toString()}/${this.end?.toString()}`;
	}

	getInstance(now: Temporal.ZonedDateTime) {
		const recurringInstant = new RecurringInstant(
			this.first.start,
			this.interval,
			this.end,
		);

		const {previous, next} = recurringInstant.getInstance(now);
		const periodDuration = this.first.getDuration();

		return {
			previous:
				previous &&
				new Period(
					previous,
					minDuration(periodDuration, this.interval, previous),
				),
			next:
				next &&
				new Period(
					next,
					minDuration(periodDuration, this.interval, next),
				),
		};
	}
}
