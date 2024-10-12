import {
	hasProperty,
	hasTypeBrand,
	type Instance,
	instanceFrom,
	isObject,
} from 'notepadd-core';

export class ListMessage {
	static from(json: unknown) {
		try {
			if (!isObject(json)) {
				throw new TypeError('Message is not an object');
			}

			if (
				!hasTypeBrand(
					json,
					'ListMessage' satisfies ListMessage['_type'],
				)
			) {
				throw new TypeError('Object is not a list message');
			}

			if (
				!hasProperty(json, 'instances') ||
				!Array.isArray(json.instances)
			) {
				throw new TypeError('Instances are invalid');
			}

			return new ListMessage(json.instances.map((i) => instanceFrom(i)));
		} catch (error) {
			throw new Error(
				`Cannot deserialize a list message from JSON: ${JSON.stringify(json, undefined, 2)}`,
				{cause: error},
			);
		}
	}

	readonly _type = 'ListMessage';

	constructor(readonly instances: Instance[]) {}
}
