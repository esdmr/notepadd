import {getDiscriminator, transformFallible} from 'notepadd-core';
import * as v from 'valibot';

export class TerminateMessage {
	static readonly schema = v.pipe(
		v.object({
			_type: v.literal('TerminateMessage'),
		}),
		transformFallible((i) => new TerminateMessage()),
	);

	readonly _type = getDiscriminator(TerminateMessage);
}
