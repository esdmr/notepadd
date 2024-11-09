import {Temporal} from 'temporal-polyfill';
import {Instance, type DirectiveChild} from '../base.ts';
import {hasProperty, hasTypeBrand, isObject} from '../../../../utils.ts';
import type {Directive} from '../types.ts';

export class Timer implements DirectiveChild {
	static from(json: unknown) {
		try {
			if (!isObject(json)) {
				throw new TypeError('Timer is not an object');
			}

			if (!hasTypeBrand(json, 'Timer' satisfies Timer['_type'])) {
				throw new TypeError('Object is not a timer');
			}

			if (!hasProperty(json, 'when') || typeof json.when !== 'string') {
				throw new TypeError('Timer is invalid');
			}

			if (!hasProperty(json, 'comment') || !Array.isArray(json.comment)) {
				throw new TypeError('Comment is invalid');
			}

			return new Timer(
				Temporal.Duration.from(json.when),
				json.comment.map(String),
			);
		} catch (error) {
			throw new Error(
				`Cannot deserialize a timer from JSON: ${JSON.stringify(json, undefined, 2)}`,
				{cause: error},
			);
		}
	}

	readonly _type = 'Timer';

	constructor(
		readonly when: Temporal.Duration,
		readonly comment: string[],
	) {}

	getInstance(now: Temporal.ZonedDateTime, directive: Directive) {
		return new Instance(directive, undefined, undefined);
	}

	getNextInstance(instance: Instance) {
		return instance;
	}

	getLabel(): string | undefined {
		return this.comment[0];
	}

	toString() {
		return `timer ${this.when.toString()}\n${this.comment.join('\n')}`;
	}
}
