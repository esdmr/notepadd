import {hasTypeBrand, isObject} from 'notepadd-core';

export class TerminateMessage {
	static from(json: unknown) {
		try {
			if (!isObject(json)) {
				throw new TypeError('Message is not an object');
			}

			if (
				!hasTypeBrand(
					json,
					'TerminateMessage' satisfies TerminateMessage['_type'],
				)
			) {
				throw new TypeError('Object is not a terminate message');
			}

			return new TerminateMessage();
		} catch {
			throw new Error(
				`Cannot deserialize a terminate message from JSON: ${JSON.stringify(json, undefined, 2)}`,
			);
		}
	}

	readonly _type = 'TerminateMessage';
}
