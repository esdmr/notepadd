import type {JsonValue} from 'type-fest';
import {RecurringPeriod} from '../../period-recurring/types.ts';
import {Period} from '../../period/types.ts';

export class OneShotEvent {
	static from(json: JsonValue) {
		if (
			typeof json !== 'object' ||
			!json ||
			!('_type' in json) ||
			json._type !== 'OneShotEvent' ||
			typeof json.when !== 'object' ||
			json.when === undefined ||
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

	toString() {
		return `${this.when.toString()};${this.comment.join('\n')}`;
	}
}

export class RecurringEvent {
	static from(json: JsonValue) {
		if (
			typeof json !== 'object' ||
			!json ||
			!('_type' in json) ||
			json._type !== 'RecurringEvent' ||
			json.when === undefined ||
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

	toString() {
		return `${this.when.toString()};${this.comment.join('\n')}`;
	}
}
