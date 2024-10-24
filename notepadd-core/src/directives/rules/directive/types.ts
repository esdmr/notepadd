import {Temporal} from 'temporal-polyfill';
import {hasProperty, hasTypeBrand, includes, isObject} from '../../../utils.ts';
import {OneShotAlarm, RecurringAlarm} from './alarm/types.ts';
import {OneShotEvent, RecurringEvent} from './event/types.ts';
import {Timer} from './timer/types.ts';
import {Instance, validInstanceStates, type DirectiveChild} from './base.ts';

export * from './base.ts';

export class Directive {
	static from(json: unknown) {
		try {
			if (!isObject(json)) {
				throw new TypeError('Directive is not an object');
			}

			if (!hasTypeBrand(json, 'Directive' satisfies Directive['_type'])) {
				throw new TypeError('Object is not a Directive');
			}

			if (
				!hasProperty(json, 'directive') ||
				!isObject(json.directive) ||
				!hasProperty(json.directive, '_type')
			) {
				throw new TypeError(`Directive child is not valid`);
			}

			let directive;

			switch (json.directive._type) {
				case 'RecurringAlarm' satisfies RecurringAlarm['_type']: {
					directive = RecurringAlarm.from(json.directive);
					break;
				}

				case 'OneShotAlarm' satisfies OneShotAlarm['_type']: {
					directive = OneShotAlarm.from(json.directive);
					break;
				}

				case 'Timer' satisfies Timer['_type']: {
					directive = Timer.from(json.directive);
					break;
				}

				case 'RecurringEvent' satisfies RecurringEvent['_type']: {
					directive = RecurringEvent.from(json.directive);
					break;
				}

				case 'OneShotEvent' satisfies OneShotEvent['_type']: {
					directive = OneShotEvent.from(json.directive);
					break;
				}

				default: {
					throw new TypeError(
						`Bug: Unhandled directive kind: ${JSON.stringify(json.directive, undefined, 2)}`,
					);
				}
			}

			return new Directive(
				directive,
				hasProperty(json, 'uri') ? String(json.uri) : undefined,
				hasProperty(json, 'cellIndex')
					? Number(json.cellIndex)
					: undefined,
			);
		} catch (error) {
			throw new Error(
				`Cannot deserialize a directive from JSON: ${JSON.stringify(json, undefined, 2)}`,
				{cause: error},
			);
		}
	}

	readonly _type = 'Directive';

	constructor(
		readonly directive: DirectiveChild,
		readonly key?: string,
		readonly cellIndex?: number,
	) {}

	getInstance(now: Temporal.ZonedDateTime) {
		return this.directive.getInstance(now, this);
	}

	getNextInstance(instance: Instance) {
		return this.directive.getNextInstance(instance);
	}

	toString() {
		return this.directive.toString();
	}
}

export function instanceFrom(json: unknown) {
	// Since an `Instance` contains a `Directive` and some methods of
	// `DirectiveChild` take/return an `Instance`, a `from` static method in
	// `Instance` cannot directly reference `Directive` without causing a
	// circular import. However, without a reference to `Directive`, an
	// `Instance` cannot be constructed. Therefore, to avoid circular imports,
	// this function cannot be a static method.

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
			Directive.from(json.directive),
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
			`Cannot deserialize a trigger message from JSON: ${JSON.stringify(json, undefined, 2)}`,
			{cause: error},
		);
	}
}

export * from './alarm/types.ts';
export * from './event/types.ts';
export * from './timer/types.ts';
