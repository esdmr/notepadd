import {Temporal} from 'temporal-polyfill';
import * as v from 'valibot';
import {
	getDiscriminator,
	transformFallible,
	zdtSchema,
} from '../../../../utils.ts';
import {RecurringInstant} from '../../instant-recurring/types.ts';
import {Instance} from '../base.ts';

export class OneShotAlarm {
	static readonly schema = v.pipe(
		v.object({
			_type: v.literal('OneShotAlarm'),
			when: zdtSchema,
		}),
		transformFallible((i) => new OneShotAlarm(i.when)),
	);

	readonly _type = getDiscriminator(OneShotAlarm);

	constructor(readonly when: Temporal.ZonedDateTime) {}

	getInstance(now: Temporal.ZonedDateTime): Instance {
		return Temporal.ZonedDateTime.compare(now, this.when) < 0
			? new Instance(undefined, this.when)
			: new Instance(this.when, undefined);
	}

	getNextInstance(instance: Instance): Instance {
		return new Instance(this.when, undefined);
	}

	toString(): string {
		return `alarm ${this.when.toString()}`;
	}
}

export class RecurringAlarm {
	static readonly schema = v.pipe(
		v.object({
			_type: v.literal('RecurringAlarm'),
			when: RecurringInstant.schema,
		}),
		transformFallible((i) => new RecurringAlarm(i.when)),
	);

	readonly _type = getDiscriminator(RecurringAlarm);

	constructor(readonly when: RecurringInstant) {}

	getInstance(now: Temporal.ZonedDateTime): Instance {
		return this.when.getInstance(now);
	}

	getNextInstance(instance: Instance): Instance {
		return this.when.getNextInstance(instance);
	}

	toString(): string {
		return `alarm ${this.when.toString()}`;
	}
}
