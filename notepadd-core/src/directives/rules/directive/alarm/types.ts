import {Temporal} from 'temporal-polyfill';
import type {JsonValue} from 'type-fest';
import {RecurringInstant} from '../../instant-recurring/types.ts';

export class OneShotAlarm {
	static from(json: JsonValue) {
		if (
			typeof json !== 'object' ||
			!json ||
			!('_type' in json) ||
			json._type !== 'OneShotAlarm' ||
			typeof json.when !== 'string' ||
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

	toString() {
		return `${this.when.toString()};${this.comment.join('\n')}`;
	}
}

export class RecurringAlarm {
	static from(json: JsonValue) {
		if (
			typeof json !== 'object' ||
			!json ||
			!('_type' in json) ||
			json._type !== 'RecurringAlarm' ||
			json.when === undefined ||
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

	toString() {
		return `${this.when.toString()};${this.comment.join('\n')}`;
	}
}
