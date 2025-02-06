import {type Temporal} from 'temporal-polyfill';
import * as v from 'valibot';
import {getDiscriminator, transformFallible} from '../../../utils.ts';
import {OneShotAlarm, RecurringAlarm} from './alarm/types.ts';
import {type DirectiveChild, Instance} from './base.ts';
import {OneShotEvent, RecurringEvent} from './event/types.ts';
import {Timer} from './timer/types.ts';

export * from './base.ts';

const emptyInstance = new Instance(undefined, undefined);

export class Directive {
	static readonly schema = v.pipe(
		v.object({
			_type: v.literal('Directive'),
			directive: v.variant('_type', [
				RecurringAlarm.schema,
				OneShotAlarm.schema,
				Timer.schema,
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

	getInstance(now: Temporal.ZonedDateTime) {
		return this.directive.getInstance?.(now) ?? emptyInstance;
	}

	getNextInstance(instance: Instance) {
		return this.directive.getNextInstance?.(instance) ?? emptyInstance;
	}

	getLabel() {
		return this.comment[0];
	}

	toString() {
		return `${this.directive.toString()}\n${this.comment.join('\n')}`;
	}
}

export * from './alarm/types.ts';
export * from './event/types.ts';
export * from './timer/types.ts';
