import {Temporal} from 'temporal-polyfill';
import type {JsonValue} from 'type-fest';

export class Timer {
	static from(json: JsonValue) {
		if (
			typeof json !== 'object' ||
			!json ||
			!('_type' in json) ||
			json._type !== 'Timer' ||
			typeof json.when !== 'string' ||
			Array.isArray(json.comment)
		) {
			throw new Error(
				`Cannot deserialize a timer from JSON: ${JSON.stringify(json)}`,
			);
		}

		return new Timer(
			Temporal.Duration.from(json.when),
			(json.comment as unknown[]).map(String),
		);
	}

	readonly _type = 'Timer';

	constructor(
		readonly when: Temporal.Duration,
		readonly comment: string[],
	) {}

	toString() {
		return `${this.when.toString()};${this.comment.join('\n')}`;
	}
}
