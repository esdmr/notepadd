import {type Temporal} from 'temporal-polyfill';
import {RecurringPeriod} from '../../period-recurring/types.ts';
import {Period} from '../../period/types.ts';
import {type Instance, type DirectiveChild} from '../base.ts';

export class OneShotEvent implements DirectiveChild {
	static from(json: unknown) {
		if (
			typeof json !== 'object' ||
			!json ||
			!('_type' in json) ||
			json._type !== 'OneShotEvent' ||
			!('when' in json) ||
			typeof json.when !== 'object' ||
			json.when === undefined ||
			!('comment' in json) ||
			Array.isArray(json.comment)
		) {
			throw new Error(
				`Cannot deserialize a one-shot event from JSON: ${JSON.stringify(json)}`,
			);
		}

		return new OneShotEvent(
			Period.from(json.when),
			(json.comment as unknown[]).map(String),
		);
	}

	readonly _type = 'OneShotEvent';

	constructor(
		readonly when: Period,
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

export class RecurringEvent implements DirectiveChild {
	static from(json: unknown) {
		if (
			typeof json !== 'object' ||
			!json ||
			!('_type' in json) ||
			json._type !== 'RecurringEvent' ||
			!('when' in json) ||
			json.when === undefined ||
			!('comment' in json) ||
			Array.isArray(json.comment)
		) {
			throw new Error(
				`Cannot deserialize a recurring event from JSON: ${JSON.stringify(json)}`,
			);
		}

		return new RecurringEvent(
			RecurringPeriod.from(json.when),
			(json.comment as unknown[]).map(String),
		);
	}

	readonly _type = 'RecurringEvent';

	constructor(
		readonly when: RecurringPeriod,
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
