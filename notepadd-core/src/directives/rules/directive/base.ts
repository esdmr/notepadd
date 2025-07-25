import {type Temporal} from 'temporal-polyfill';
import * as v from 'valibot';
import {
	getDiscriminator,
	transformFallible,
	zdtSchema,
} from '../../../utils.ts';

const instanceStateSchema = v.picklist(['pulse', 'high', 'low']);
export type InstanceState = v.InferOutput<typeof instanceStateSchema>;

export class Instance {
	static readonly schema = v.pipe(
		v.object({
			_type: v.literal('Instance'),
			previous: v.optional(zdtSchema),
			next: v.optional(zdtSchema),
			currentState: instanceStateSchema,
		}),
		transformFallible(
			(i) => new Instance(i.previous, i.next, i.currentState),
		),
	);

	readonly _type = getDiscriminator(Instance);

	constructor(
		readonly previous: Temporal.ZonedDateTime | undefined,
		readonly next: Temporal.ZonedDateTime | undefined,
		readonly currentState: InstanceState = 'pulse',
	) {}
}
