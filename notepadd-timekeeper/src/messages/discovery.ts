import {getDiscriminator, transformFallible, v} from 'notepadd-core';

export class DiscoveryMessage {
	static readonly schema = v.pipe(
		v.object({
			_type: v.literal('DiscoveryMessage'),
		}),
		transformFallible((i) => new DiscoveryMessage()),
	);

	readonly _type = getDiscriminator(DiscoveryMessage);
}
