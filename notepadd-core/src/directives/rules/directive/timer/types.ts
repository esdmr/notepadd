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

			return new Timer(Temporal.Duration.from(json.when));
		} catch (error) {
			throw new Error(
				`Cannot deserialize a timer from JSON: ${JSON.stringify(json, undefined, 2)}`,
				{cause: error},
			);
		}
	}

	readonly _type = 'Timer';

	constructor(readonly when: Temporal.Duration) {}

	getInstance(now: Temporal.ZonedDateTime) {
		return new Instance(undefined, undefined);
	}

	getNextInstance(instance: Instance) {
		return instance;
	}

	toString() {
		return `timer ${this.when.toString()}`;
	}
}
