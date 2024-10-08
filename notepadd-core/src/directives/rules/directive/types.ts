import type {Temporal} from 'temporal-polyfill';
import {hasProperty, hasTypeBrand, isObject} from '../../../utils.ts';
import {OneShotAlarm, RecurringAlarm} from './alarm/types.ts';
import {OneShotEvent, RecurringEvent} from './event/types.ts';
import {Timer} from './timer/types.ts';
import type {DirectiveChild, Instance} from './base.ts';

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

			return new Directive(directive);
		} catch (error) {
			throw new Error(
				`Cannot deserialize a directive from JSON: ${JSON.stringify(json, undefined, 2)}`,
				{cause: error},
			);
		}
	}

	readonly _type = 'Directive';

	constructor(readonly directive: DirectiveChild) {}

	getInstance(now: Temporal.ZonedDateTime) {
		return this.directive.getInstance(now);
	}

	getNextInstance(instance: Instance) {
		return this.directive.getNextInstance(instance);
	}

	toString() {
		return this.directive.toString();
	}
}

export * from './alarm/types.ts';
export * from './event/types.ts';
export * from './timer/types.ts';
