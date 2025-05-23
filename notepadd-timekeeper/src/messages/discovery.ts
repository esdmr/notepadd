import {getDiscriminator, transformFallible} from 'notepadd-core';
import * as v from 'valibot';

export class DiscoveryMessage {
	static readonly schema = v.pipe(
		v.object({
			_type: v.literal('DiscoveryMessage'),
		}),
		transformFallible((i) => new DiscoveryMessage()),
	);

	readonly _type = getDiscriminator(DiscoveryMessage);
}
