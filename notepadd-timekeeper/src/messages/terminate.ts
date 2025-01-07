import {getDiscriminator, transformFallible, v} from 'notepadd-core';

export class TerminateMessage {
	static readonly schema = v.pipe(
		v.object({
			_type: v.literal('TerminateMessage'),
		}),
		transformFallible((i) => new TerminateMessage()),
	);

	readonly _type = getDiscriminator(TerminateMessage);
}
