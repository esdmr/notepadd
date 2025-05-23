import {getDiscriminator, transformFallible} from 'notepadd-core';
import * as v from 'valibot';
import {DirectiveState} from '../types.ts';

export class TriggerMessage {
	static readonly schema = v.pipe(
		v.object({
			_type: v.literal('TriggerMessage'),
			state: DirectiveState.schema,
		}),
		transformFallible((i) => new TriggerMessage(i.state)),
	);

	readonly _type = getDiscriminator(TriggerMessage);

	constructor(readonly state: DirectiveState) {}
}
