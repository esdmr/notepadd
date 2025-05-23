import {type Temporal} from 'temporal-polyfill';
import * as v from 'valibot';
import {getDiscriminator, transformFallible} from '../../../utils.ts';
import {OneShotAlarm, RecurringAlarm} from './alarm/types.ts';
import {Instance} from './base.ts';
import {OneShotEvent, RecurringEvent} from './event/types.ts';
import {Reference} from './reference/types.ts';
import {Timer} from './timer/types.ts';

export * from './base.ts';

const emptyInstance = new Instance(undefined, undefined);

export type DirectiveChild =
	| OneShotAlarm
	| RecurringAlarm
	| Timer
	| Reference
	| OneShotEvent
	| RecurringEvent;

export class Directive {
	static readonly schema = v.pipe(
		v.object({
			_type: v.literal('Directive'),
			directive: v.variant('_type', [
				RecurringAlarm.schema,
				OneShotAlarm.schema,
				Timer.schema,
				Reference.schema,
				RecurringEvent.schema,
				OneShotEvent.schema,
			]),
			comment: v.array(v.string()),
		}),
		transformFallible((i) => new Directive(i.directive, i.comment)),
	);

	readonly _type = getDiscriminator(Directive);

	constructor(
		readonly directive: DirectiveChild,
		readonly comment: readonly string[] = [],
	) {}

	getInstance(now: Temporal.ZonedDateTime): Instance {
		return this.directive.getInstance?.(now) ?? emptyInstance;
	}

	getNextInstance(instance: Instance): Instance {
		return this.directive.getNextInstance?.(instance) ?? emptyInstance;
	}

	getLabel(): string | undefined {
		return this.comment[0];
	}

	toString(): string {
		return `${this.directive.toString()}\n${this.comment.join('\n')}`;
	}
}

export * from './alarm/types.ts';
export * from './event/types.ts';
export * from './reference/types.ts';
export * from './timer/types.ts';
