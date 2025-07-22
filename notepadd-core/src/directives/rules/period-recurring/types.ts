import {Temporal} from 'temporal-polyfill';
import * as v from 'valibot';
import {
	durationSchema,
	transformFallible,
	getDiscriminator,
	minDuration,
	zdtSchema,
} from '../../../utils.ts';
import {Instance} from '../directive/base.ts';
import {RecurringZdt} from '../zdt-recurring/types.ts';
import {Period} from '../period/types.ts';

export class RecurringPeriod {
	static readonly schema = v.pipe(
		v.object({
			_type: v.literal('RecurringPeriod'),
			first: Period.schema,
			interval: durationSchema,
			end: v.optional(zdtSchema),
		}),
		transformFallible(
			(i) => new RecurringPeriod(i.first, i.interval, i.end),
		),
	);

	readonly _type = getDiscriminator(RecurringPeriod);
	private readonly _recurringZdt;
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

		if (interval.sign <= 0) {
			throw new RangeError(
				'Recurring period has a non-positive interval',
			);
		}

		this._recurringZdt = new RecurringZdt(
			this.first.start,
			this.interval,
			this.end,
		);

		this._periodDuration = this.first.getDuration();
	}

	// eslint-disable-next-line @typescript-eslint/naming-convention
	toJSON(): unknown {
		return {
			...this,
			_recurringZdt: undefined,
			_periodDuration: undefined,
		};
	}

	toString(): string {
		return `R/${this.first.toString()}/${this.interval.toString()}/${this.end?.toString()}`;
	}

	getInstance(now: Temporal.ZonedDateTime): Instance {
		const instance = this._recurringZdt.getInstance(now);

		if (!instance.previous) {
			return new Instance(undefined, instance.next, 'low');
		}

		const previous = new Period(
			instance.previous,
			minDuration(this._periodDuration, this.interval, instance.previous),
		);

		switch (previous.checkBounds(now)) {
			case -1: {
				throw new RangeError(
					`Bug: Current time (${now.toString()}) is before the start of the previous period (${previous.toString()}): ${this.toString()}`,
				);
			}

			case 0: {
				return new Instance(previous.start, previous.getEnd(), 'high');
			}

			case 1: {
				return new Instance(previous.getEnd(), instance.next, 'low');
			}
		}
	}

	getNextInstance(instance: Instance): Instance {
		if (!instance.next) return instance;

		if (instance.currentState === 'low') {
			const nextStart = instance.next;
			const nextEnd = new Period(
				nextStart,
				minDuration(this._periodDuration, this.interval, nextStart),
			).getEnd();

			return new Instance(nextStart, nextEnd, 'high');
		}

		const previousStart = instance.previous;
		const previousEnd = instance.next;

		const nextStart = this._recurringZdt.getNextInstance(
			new Instance(undefined, previousStart),
		).next;

		return new Instance(previousEnd, nextStart, 'low');
	}
}
