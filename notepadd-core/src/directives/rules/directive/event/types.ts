import {type Temporal} from 'temporal-polyfill';
import * as v from 'valibot';
import {getDiscriminator, transformFallible} from '../../../../utils.ts';
import {RecurringPeriod} from '../../period-recurring/types.ts';
import {Period} from '../../period/types.ts';
import {type DirectiveChild, type Instance} from '../base.ts';

export class OneShotEvent implements DirectiveChild {
	static readonly schema = v.pipe(
		v.object({
			_type: v.literal('OneShotEvent'),
			when: Period.schema,
		}),
		transformFallible((i) => new OneShotEvent(i.when)),
	);

	readonly _type = getDiscriminator(OneShotEvent);

	constructor(readonly when: Period) {}

	getInstance(now: Temporal.ZonedDateTime) {
		return this.when.getInstance(now);
	}

	getNextInstance(instance: Instance) {
		return this.when.getNextInstance(instance);
	}

	toString() {
		return `event ${this.when.toString()}`;
	}
}

export class RecurringEvent implements DirectiveChild {
	static readonly schema = v.pipe(
		v.object({
			_type: v.literal('RecurringEvent'),
			when: RecurringPeriod.schema,
		}),
		transformFallible((i) => new RecurringEvent(i.when)),
	);

	readonly _type = getDiscriminator(RecurringEvent);

	constructor(readonly when: RecurringPeriod) {}

	getInstance(now: Temporal.ZonedDateTime) {
		return this.when.getInstance(now);
	}

	getNextInstance(instance: Instance) {
		return this.when.getNextInstance(instance);
	}

	toString() {
		return `event ${this.when.toString()}`;
	}
}
