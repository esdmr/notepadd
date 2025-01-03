import {type Temporal} from 'temporal-polyfill';
import {RecurringPeriod} from '../../period-recurring/types.ts';
import {Period} from '../../period/types.ts';
import {type Instance, type DirectiveChild} from '../base.ts';
import {hasProperty, hasTypeBrand, isObject} from '../../../../utils.ts';
import type {Directive} from '../types.ts';

export class OneShotEvent implements DirectiveChild {
	static from(json: unknown) {
		try {
			if (!isObject(json)) {
				throw new TypeError('One-shot event is not an object');
			}

			if (
				!hasTypeBrand(
					json,
					'OneShotEvent' satisfies OneShotEvent['_type'],
				)
			) {
				throw new TypeError('Object is not a one-shot event');
			}

			if (!hasProperty(json, 'when')) {
				throw new TypeError('One-shot event is invalid');
			}

			return new OneShotEvent(Period.from(json.when));
		} catch (error) {
			throw new Error(
				`Cannot deserialize a one-shot event from JSON: ${JSON.stringify(json, undefined, 2)}`,
				{cause: error},
			);
		}
	}

	readonly _type = 'OneShotEvent';

	constructor(readonly when: Period) {}

	getInstance(now: Temporal.ZonedDateTime) {
		return this.when.getInstance(now);
	}

	getNextInstance(instance: Instance) {
		return this.when.getNextInstance(instance);
	}

	toString() {
		return `event ${this.when.toString()}`;
	}
}

export class RecurringEvent implements DirectiveChild {
	static from(json: unknown) {
		try {
			if (!isObject(json)) {
				throw new TypeError('Recurring event is not an object');
			}

			if (
				!hasTypeBrand(
					json,
					'RecurringEvent' satisfies RecurringEvent['_type'],
				)
			) {
				throw new TypeError('Object is not a recurring event');
			}

			if (!hasProperty(json, 'when')) {
				throw new TypeError('Recurring event is invalid');
			}

			return new RecurringEvent(RecurringPeriod.from(json.when));
		} catch (error) {
			throw new Error(
				`Cannot deserialize a recurring event from JSON: ${JSON.stringify(json, undefined, 2)}`,
				{cause: error},
			);
		}
	}

	readonly _type = 'RecurringEvent';

	constructor(readonly when: RecurringPeriod) {}

	getInstance(now: Temporal.ZonedDateTime) {
		return this.when.getInstance(now);
	}

	getNextInstance(instance: Instance) {
		return this.when.getNextInstance(instance);
	}

	toString() {
		return `event ${this.when.toString()}`;
	}
}
