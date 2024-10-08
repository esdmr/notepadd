import {Temporal} from 'temporal-polyfill';
import {RecurringInstant} from '../../instant-recurring/types.ts';
import {Instance, type DirectiveChild} from '../base.ts';

export class OneShotAlarm implements DirectiveChild {
	static from(json: unknown) {
		if (
			typeof json !== 'object' ||
			!json ||
			!('_type' in json) ||
			json._type !== 'OneShotAlarm' ||
			!('when' in json) ||
			typeof json.when !== 'string' ||
			!('comment' in json) ||
			Array.isArray(json.comment)
		) {
			throw new Error(
				`Cannot deserialize a one-shot alarm from JSON: ${JSON.stringify(json)}`,
			);
		}

		return new OneShotAlarm(
			Temporal.ZonedDateTime.from(json.when),
			(json.comment as unknown[]).map(String),
		);
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
		if (
			typeof json !== 'object' ||
			!json ||
			!('_type' in json) ||
			json._type !== 'RecurringAlarm' ||
			!('when' in json) ||
			json.when === undefined ||
			!('comment' in json) ||
			Array.isArray(json.comment)
		) {
			throw new Error(
				`Cannot deserialize a recurring alarm from JSON: ${JSON.stringify(json)}`,
			);
		}

		return new RecurringAlarm(
			RecurringInstant.from(json.when),
			(json.comment as unknown[]).map(String),
		);
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
