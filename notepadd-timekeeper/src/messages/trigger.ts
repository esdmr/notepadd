import {getDiscriminator, transformFallible, v} from 'notepadd-core';
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
