import {type Temporal} from 'temporal-polyfill';
import * as v from 'valibot';
import {
	durationSchema,
	getDiscriminator,
	transformFallible,
} from '../../../../utils.ts';
import {Instance, type DirectiveChild} from '../base.ts';

export class Timer implements DirectiveChild {
	static readonly schema = v.pipe(
		v.object({
			_type: v.literal('Timer'),
			when: durationSchema,
		}),
		transformFallible((i) => new Timer(i.when)),
	);

	readonly _type = getDiscriminator(Timer);

	constructor(readonly when: Temporal.Duration) {}

	toString() {
		return `timer ${this.when.toString()}`;
	}
}
