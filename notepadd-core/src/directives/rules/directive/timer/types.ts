import {Temporal} from 'temporal-polyfill';
import {Instance, type DirectiveChild} from '../base.ts';

export class Timer implements DirectiveChild {
	static from(json: unknown) {
		if (
			typeof json !== 'object' ||
			!json ||
			!('_type' in json) ||
			json._type !== 'Timer' ||
			!('when' in json) ||
			typeof json.when !== 'string' ||
			!('comment' in json) ||
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

	getInstance(now: Temporal.ZonedDateTime) {
		return new Instance(undefined, undefined);
	}

	getNextInstance(instance: Instance) {
		return instance;
	}

	toString() {
		return `${this.when.toString()};${this.comment.join('\n')}`;
	}
}
