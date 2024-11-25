import {hasProperty, hasTypeBrand, isObject} from 'notepadd-core';
import {DirectiveState} from '../types.ts';

export class TriggerMessage {
	static from(json: unknown) {
		try {
			if (!isObject(json)) {
				throw new TypeError('Message is not an object');
			}

			if (
				!hasTypeBrand(
					json,
					'TriggerMessage' satisfies TriggerMessage['_type'],
				)
			) {
				throw new TypeError('Object is not a trigger message');
			}

			if (!hasProperty(json, 'state')) {
				throw new TypeError('Instance is invalid');
			}

			return new TriggerMessage(DirectiveState.from(json.state));
		} catch (error) {
			throw new Error(
				`Cannot deserialize a trigger message from JSON: ${JSON.stringify(json, undefined, 2)}`,
				{cause: error},
			);
		}
	}

	readonly _type = 'TriggerMessage';

	constructor(readonly state: DirectiveState) {}
}
