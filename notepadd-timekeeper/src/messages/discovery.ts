import {hasTypeBrand, isObject} from 'notepadd-core';

export class DiscoveryMessage {
	static from(json: unknown) {
		try {
			if (!isObject(json)) {
				throw new TypeError('Message is not an object');
			}

			if (
				!hasTypeBrand(
					json,
					'DiscoveryMessage' satisfies DiscoveryMessage['_type'],
				)
			) {
				throw new TypeError('Object is not a discovery message');
			}

			return new DiscoveryMessage();
		} catch (error) {
			throw new Error(
				`Cannot deserialize a discovery message from JSON: ${JSON.stringify(json, undefined, 2)}`,
				{cause: error},
			);
		}
	}

	readonly _type = 'DiscoveryMessage';
}
