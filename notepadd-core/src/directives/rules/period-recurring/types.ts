import {Temporal} from 'temporal-polyfill';
import {minDuration} from '../../../utils.ts';
import {Period} from '../period/types.ts';
import {RecurringInstant} from '../instant-recurring/types.ts';

export class RecurringPeriod {
	static from(json: unknown) {
		if (
			typeof json !== 'object' ||
			!json ||
			!('_type' in json) ||
			json._type !== 'RecurringPeriod' ||
			!('first' in json) ||
			json.first === undefined ||
			!('interval' in json) ||
			typeof json.interval !== 'string'
		) {
			throw new Error(
				`Cannot deserialize a recurring period from JSON: ${JSON.stringify(json)}`,
			);
		}

		return new RecurringPeriod(
			Period.from(json.first),
			Temporal.Duration.from(json.interval),
			'end' in json && typeof json.end === 'string'
				? Temporal.ZonedDateTime.from(json.end)
				: undefined,
		);
	}

	readonly _type = 'RecurringPeriod';
	private readonly _recurringInstant;
	private readonly _periodDuration;

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

		if (interval.blank) {
			throw new RangeError('Recurring period has a zero interval');
		}

		this._recurringInstant = new RecurringInstant(
			this.first.start,
			this.interval,
			this.end,
		);

		this._periodDuration = this.first.getDuration();
	}

	// eslint-disable-next-line @typescript-eslint/naming-convention
	toJSON() {
		return {
			...this,
			_recurringInstant: undefined,
			_periodDuration: undefined,
		};
	}

	toString() {
		return `R/${this.first.toString()}/${this.interval.toString()}/${this.end?.toString()}`;
	}

	getInstance(now: Temporal.ZonedDateTime) {
		const next = this._recurringInstant.getInstance(now);

		return (
			next &&
			new Period(
				next,
				minDuration(this._periodDuration, this.interval, next),
			)
		);
	}

	getNextInstance(instance: Period) {
		const next = this._recurringInstant.getNextInstance(instance.start);

		return (
			next &&
			new Period(
				next,
				minDuration(this._periodDuration, this.interval, next),
			)
		);
	}
}
