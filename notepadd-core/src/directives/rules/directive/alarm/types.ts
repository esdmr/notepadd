import {Temporal} from 'temporal-polyfill';
import {RecurringInstant} from '../../instant-recurring/types.ts';
import {Instance, type DirectiveChild} from '../base.ts';
import {hasProperty, hasTypeBrand, isObject} from '../../../../utils.ts';

export class OneShotAlarm implements DirectiveChild {
	static from(json: unknown) {
		try {
			if (!isObject(json)) {
				throw new TypeError('One-shot alarm is not an object');
			}

			if (
				!hasTypeBrand(
					json,
					'OneShotAlarm' satisfies OneShotAlarm['_type'],
				)
			) {
				throw new TypeError('Object is not a one-shot alarm');
			}

			if (!hasProperty(json, 'when') || typeof json.when !== 'string') {
				throw new TypeError('One-shot alarm is invalid');
			}

			if (!hasProperty(json, 'comment') || !Array.isArray(json.comment)) {
				throw new TypeError('Comment is invalid');
			}

			return new OneShotAlarm(
				Temporal.ZonedDateTime.from(json.when),
				json.comment.map(String),
			);
		} catch (error) {
			throw new Error(
				`Cannot deserialize a one-shot alarm from JSON: ${JSON.stringify(json, undefined, 2)}`,
				{cause: error},
			);
		}
	}

	readonly _type = 'OneShotAlarm';

	constructor(
		readonly when: Temporal.ZonedDateTime,
		readonly comment: string[],
	) {}

	getInstance(now: Temporal.ZonedDateTime) {
		return Temporal.ZonedDateTime.compare(now, this.when) < 0
			? new Instance(undefined, this.when)
			: new Instance(this.when, undefined);
	}

	getNextInstance(instance: Instance) {
		return new Instance(this.when, undefined);
	}

	toString() {
		return `${this.when.toString()};${this.comment.join('\n')}`;
	}
}

export class RecurringAlarm implements DirectiveChild {
	static from(json: unknown) {
		try {
			if (!isObject(json)) {
				throw new TypeError('Recurring alarm is not an object');
			}

			if (
				!hasTypeBrand(
					json,
					'RecurringAlarm' satisfies RecurringAlarm['_type'],
				)
			) {
				throw new TypeError('Object is not a recurring alarm');
			}

			if (!hasProperty(json, 'when')) {
				throw new TypeError('Recurring alarm is invalid');
			}

			if (!hasProperty(json, 'comment') || !Array.isArray(json.comment)) {
				throw new TypeError('Comment is invalid');
			}

			return new RecurringAlarm(
				RecurringInstant.from(json.when),
				json.comment.map(String),
			);
		} catch (error) {
			throw new Error(
				`Cannot deserialize a recurring alarm from JSON: ${JSON.stringify(json, undefined, 2)}`,
				{cause: error},
			);
		}
	}

	readonly _type = 'RecurringAlarm';

	constructor(
		readonly when: RecurringInstant,
		readonly comment: string[],
	) {}

	getInstance(now: Temporal.ZonedDateTime) {
		return this.when.getInstance(now);
	}

	getNextInstance(instance: Instance) {
		return this.when.getNextInstance(instance);
	}

	toString() {
		return `${this.when.toString()};${this.comment.join('\n')}`;
	}
}
