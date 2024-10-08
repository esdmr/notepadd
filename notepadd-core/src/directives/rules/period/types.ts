import {Temporal} from 'temporal-polyfill';
import {Instance} from '../directive/base.ts';

export class Period {
	static from(json: unknown) {
		if (
			typeof json !== 'object' ||
			!json ||
			!('_type' in json) ||
			json._type !== 'Period' ||
			!('start' in json) ||
			typeof json.start !== 'string' ||
			!('endOrDuration' in json) ||
			typeof json.endOrDuration !== 'string'
		) {
			throw new Error(
				`Cannot deserialize a period from JSON: ${JSON.stringify(json)}`,
			);
		}

		return new Period(
			Temporal.ZonedDateTime.from(json.start),
			json.endOrDuration.startsWith('P')
				? Temporal.Duration.from(json.endOrDuration)
				: Temporal.ZonedDateTime.from(json.endOrDuration),
		);
	}

	readonly _type = 'Period';

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

	toString() {
		return `P/${this.start.toString()}/${this.endOrDuration.toString()}`;
	}

	getEnd() {
		return this.endOrDuration instanceof Temporal.ZonedDateTime
			? this.endOrDuration
			: this.start.add(this.endOrDuration);
	}

	getDuration() {
		return this.endOrDuration instanceof Temporal.Duration
			? this.endOrDuration
			: this.start.until(this.endOrDuration);
	}

	checkBounds(instance: Temporal.ZonedDateTime) {
		const end = this.getEnd();

		const isBeforeStart =
			Temporal.ZonedDateTime.compare(instance, this.start) < 0;
		const isAfterEnd = Temporal.ZonedDateTime.compare(end, instance) <= 0;

		return isBeforeStart ? -1 : isAfterEnd ? 1 : 0;
	}

	getInstance(now: Temporal.ZonedDateTime) {
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

	getNextInstance(instance: Instance) {
		return instance.currentState === 'low'
			? new Instance(this.start, this.getEnd(), 'high')
			: new Instance(this.getEnd(), undefined, 'low');
	}
}
