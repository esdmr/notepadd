import {Temporal} from 'temporal-polyfill';
import {Instance} from '../directive/base.ts';
import {hasProperty, hasTypeBrand, isObject} from '../../../utils.ts';
import type {Directive} from '../types.ts';

export class Period {
	static from(json: unknown) {
		try {
			if (!isObject(json)) {
				throw new TypeError('Period is not an object');
			}

			if (!hasTypeBrand(json, 'Period' satisfies Period['_type'])) {
				throw new TypeError('Object is not a period');
			}

			if (!hasProperty(json, 'start') || typeof json.start !== 'string') {
				throw new TypeError('Period start is invalid');
			}

			if (
				!hasProperty(json, 'endOrDuration') ||
				typeof json.endOrDuration !== 'string'
			) {
				throw new TypeError('Period end/duration is invalid');
			}

			return new Period(
				Temporal.ZonedDateTime.from(json.start),
				json.endOrDuration.startsWith('P')
					? Temporal.Duration.from(json.endOrDuration)
					: Temporal.ZonedDateTime.from(json.endOrDuration),
			);
		} catch (error) {
			throw new Error(
				`Cannot deserialize a period from JSON: ${JSON.stringify(json, undefined, 2)}`,
				{cause: error},
			);
		}
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

	getInstance(now: Temporal.ZonedDateTime, directive: Directive) {
		switch (this.checkBounds(now)) {
			case -1: {
				return new Instance(directive, undefined, this.start, 'low');
			}

			case 0: {
				return new Instance(
					directive,
					this.start,
					this.getEnd(),
					'high',
				);
			}

			case 1: {
				return new Instance(directive, this.getEnd(), undefined, 'low');
			}
		}
	}

	getNextInstance(instance: Instance) {
		return instance.currentState === 'low'
			? new Instance(
					instance.directive,
					this.start,
					this.getEnd(),
					'high',
				)
			: new Instance(instance.directive, this.getEnd(), undefined, 'low');
	}
}
