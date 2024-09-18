import type {JsonValue} from 'type-fest';
import type {DirectiveNode} from './ast.ts';
import {Timer} from './timer/types.ts';
import {RecurringAlarm, OneShotAlarm} from './alarm/types.ts';
import {RecurringEvent, OneShotEvent} from './event/types.ts';

export type DirectiveChild =
	| RecurringAlarm
	| OneShotAlarm
	| Timer
	| RecurringEvent
	| OneShotEvent;

export class Directive {
	static from(json: JsonValue) {
		if (
			typeof json !== 'object' ||
			!json ||
			!('_type' in json) ||
			json._type !== 'Directive' ||
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

		return new Directive(directive, json.ast);
	}

	readonly _type = 'Directive';

	constructor(
		readonly directive: DirectiveChild,
		readonly ast?: DirectiveNode | JsonValue,
	) {}
}
