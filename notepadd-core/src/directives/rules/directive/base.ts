import {Temporal} from 'temporal-polyfill';
import {hasProperty, hasTypeBrand, includes, isObject} from '../../../utils.ts';

const validInstanceStates = ['pulse', 'high', 'low'] as const;
export type ValidInstanceState = (typeof validInstanceStates)[number];

export class Instance {
	static from(json: unknown) {
		try {
			if (!isObject(json)) {
				throw new TypeError('Instance is not an object');
			}

			if (!hasTypeBrand(json, 'Instance' satisfies Instance['_type'])) {
				throw new TypeError('Object is not an instance');
			}

			if (!hasProperty(json, 'directive')) {
				throw new TypeError('Invalid directive');
			}

			if (
				hasProperty(json, 'previous') &&
				typeof json.previous !== 'string'
			) {
				throw new TypeError('Invalid previous instance');
			}

			if (hasProperty(json, 'next') && typeof json.next !== 'string') {
				throw new TypeError('Invalid next instance');
			}

			if (
				!hasProperty(json, 'currentState') ||
				!includes(validInstanceStates, json.currentState)
			) {
				throw new TypeError('Instance current state is invalid');
			}

			return new Instance(
				hasProperty(json, 'previous')
					? Temporal.ZonedDateTime.from(json.previous as string)
					: undefined,
				hasProperty(json, 'next')
					? Temporal.ZonedDateTime.from(json.next as string)
					: undefined,
				json.currentState,
			);
		} catch (error) {
			throw new Error(
				`Cannot deserialize an instance from JSON: ${JSON.stringify(json, undefined, 2)}`,
				{cause: error},
			);
		}
	}

	readonly _type = 'Instance';

	constructor(
		readonly previous: Temporal.ZonedDateTime | undefined,
		readonly next: Temporal.ZonedDateTime | undefined,
		readonly currentState: ValidInstanceState = 'pulse',
	) {}
}

export type DirectiveChild = {
	getInstance(now: Temporal.ZonedDateTime): Instance;
	getNextInstance(instance: Instance): Instance;
	toString(): string;
};
