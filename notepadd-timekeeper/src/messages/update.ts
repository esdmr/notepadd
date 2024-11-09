import {hasProperty, hasTypeBrand, isObject, mapRecord} from 'notepadd-core';

export class UpdateMessage {
	static from(json: unknown) {
		try {
			if (!isObject(json)) {
				throw new TypeError('Message is not an object');
			}

			if (
				!hasTypeBrand(
					json,
					'UpdateMessage' satisfies UpdateMessage['_type'],
				)
			) {
				throw new TypeError('Object is not an update message');
			}

			if (!hasProperty(json, 'changed') || !isObject(json.changed)) {
				throw new TypeError('Changes are invalid');
			}

			if (
				!hasProperty(json, 'partial') ||
				typeof json.partial !== 'boolean'
			) {
				throw new TypeError('Partial is invalid');
			}

			if (
				!hasProperty(json, 'fetchRequested') ||
				typeof json.fetchRequested !== 'boolean'
			) {
				throw new TypeError('Fetch request is invalid');
			}

			return new UpdateMessage(
				mapRecord(json.changed as Record<string, unknown>, ([k, v]) => [
					String(k),
					String(v),
				]),
				json.partial,
				json.fetchRequested,
			);
		} catch (error) {
			throw new Error(
				`Cannot deserialize an update message from JSON: ${JSON.stringify(json, undefined, 2)}`,
				{cause: error},
			);
		}
	}

	readonly _type = 'UpdateMessage';

	constructor(
		readonly changed: Record<string, string>,
		readonly partial: boolean,
		readonly fetchRequested: boolean,
	) {}
}
