import {OneShotAlarm, RecurringAlarm} from './alarm/types.ts';
import {OneShotEvent, RecurringEvent} from './event/types.ts';
import {Timer} from './timer/types.ts';

export type DirectiveChild =
	| RecurringAlarm
	| OneShotAlarm
	| Timer
	| RecurringEvent
	| OneShotEvent;

export class Directive {
	static from(json: unknown) {
		if (
			typeof json !== 'object' ||
			!json ||
			!('_type' in json) ||
			json._type !== 'Directive' ||
			!('directive' in json) ||
			typeof json.directive !== 'object' ||
			!json.directive ||
			!('_type' in json.directive)
		) {
			throw new Error(
				`Cannot deserialize a directive from JSON: ${JSON.stringify(json)}`,
			);
		}

		let directive;

		switch (json.directive._type) {
			case 'RecurringAlarm': {
				directive = RecurringAlarm.from(json.directive);
				break;
			}

			case 'OneShotAlarm': {
				directive = OneShotAlarm.from(json.directive);
				break;
			}

			case 'Timer': {
				directive = Timer.from(json.directive);
				break;
			}

			case 'RecurringEvent': {
				directive = RecurringEvent.from(json.directive);
				break;
			}

			case 'OneShotEvent': {
				directive = OneShotEvent.from(json.directive);
				break;
			}

			default: {
				throw new TypeError(
					`Bug: Unhandled directive kind: ${JSON.stringify(json.directive)}`,
				);
			}
		}

		return new Directive(directive, 'ast' in json ? json.ast : undefined);
	}

	readonly _type = 'Directive';

	constructor(
		readonly directive: DirectiveChild,
		readonly ast?: unknown,
	) {}

	toString() {
		return this.directive.toString();
	}
}

export * from './alarm/types.ts';
export * from './event/types.ts';
export * from './timer/types.ts';
