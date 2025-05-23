import {getDiscriminator, transformFallible} from 'notepadd-core';
import * as v from 'valibot';
import {DirectiveState} from '../types.ts';

export class ListMessage {
	static readonly schema = v.pipe(
		v.object({
			_type: v.literal('ListMessage'),
			states: v.array(DirectiveState.schema),
		}),
		transformFallible((i) => new ListMessage(i.states)),
	);

	readonly _type = getDiscriminator(ListMessage);

	constructor(readonly states: DirectiveState[]) {}
}
