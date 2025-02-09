import {type Temporal} from 'temporal-polyfill';
import * as v from 'valibot';
import {
	durationSchema,
	getDiscriminator,
	transformFallible,
} from '../../../../utils.ts';
import {Instance, type DirectiveChild} from '../base.ts';

export class Reference implements DirectiveChild {
	static readonly schema = v.pipe(
		v.object({
			_type: v.literal('Reference'),
			target: v.string(),
		}),
		transformFallible((i) => new Reference(i.target)),
	);

	readonly _type = getDiscriminator(Reference);

	constructor(readonly target: string) {}

	toString() {
		return `reference <${this.target}>`;
	}
}
