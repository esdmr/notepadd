import {hasTypeBrand, isObject} from 'notepadd-core';

export class FetchMessage {
	static from(json: unknown) {
		try {
			if (!isObject(json)) {
				throw new TypeError('Message is not an object');
			}

			if (
				!hasTypeBrand(
					json,
					'FetchMessage' satisfies FetchMessage['_type'],
				)
			) {
				throw new TypeError('Object is not a fetch message');
			}

			return new FetchMessage();
		} catch (error) {
			throw new Error(
				`Cannot deserialize a fetch message from JSON: ${JSON.stringify(json, undefined, 2)}`,
				{cause: error},
			);
		}
	}

	readonly _type = 'FetchMessage';
}
