import {Temporal} from 'temporal-polyfill';
import * as v from 'valibot';
import {
	durationSchema,
	transformFallible,
	getDiscriminator,
	zonedDateTimeSchema,
} from '../../../utils.ts';
import {Instance} from '../directive/base.ts';

export class Period {
	static readonly schema = v.pipe(
		v.object({
			_type: v.literal('Period'),
			start: zonedDateTimeSchema,
			endOrDuration: v.union([durationSchema, zonedDateTimeSchema]),
		}),
		transformFallible((i) => new Period(i.start, i.endOrDuration)),
	);

	readonly _type = getDiscriminator(Period);

	constructor(
		readonly start: Temporal.ZonedDateTime,
		readonly endOrDuration: Temporal.ZonedDateTime | Temporal.Duration,
	) {
		const end = this.getEnd();

		if (Temporal.ZonedDateTime.compare(end, start) <= 0) {
			throw new RangeError(
				`Period ends (${end.toString()}) before it starts (${start.toString()})`,
			);
		}
	}

	toString(): string {
		return `P/${this.start.toString()}/${this.endOrDuration.toString()}`;
	}

	getEnd(): Temporal.ZonedDateTime {
		return this.endOrDuration instanceof Temporal.ZonedDateTime
			? this.endOrDuration
			: this.start.add(this.endOrDuration);
	}

	getDuration(): Temporal.Duration {
		return this.endOrDuration instanceof Temporal.Duration
			? this.endOrDuration
			: this.start.until(
					this.endOrDuration.withCalendar(this.start.calendarId),
				);
	}

	checkBounds(instance: Temporal.ZonedDateTime): Temporal.ComparisonResult {
		const end = this.getEnd();

		const isBeforeStart =
			Temporal.ZonedDateTime.compare(instance, this.start) < 0;
		const isAfterEnd = Temporal.ZonedDateTime.compare(end, instance) <= 0;

		return isBeforeStart ? -1 : isAfterEnd ? 1 : 0;
	}

	getInstance(now: Temporal.ZonedDateTime): Instance {
		switch (this.checkBounds(now)) {
			case -1: {
				return new Instance(undefined, this.start, 'low');
			}

			case 0: {
				return new Instance(this.start, this.getEnd(), 'high');
			}

			case 1: {
				return new Instance(this.getEnd(), undefined, 'low');
			}
		}
	}

	getNextInstance(instance: Instance): Instance {
		return instance.currentState === 'low'
			? new Instance(this.start, this.getEnd(), 'high')
			: new Instance(this.getEnd(), undefined, 'low');
	}
}
