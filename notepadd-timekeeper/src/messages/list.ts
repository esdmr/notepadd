import {hasProperty, hasTypeBrand, isObject} from 'notepadd-core';
import {DirectiveState} from '../types.ts';

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

			if (!hasProperty(json, 'states') || !Array.isArray(json.states)) {
				throw new TypeError('Instances are invalid');
			}

			return new ListMessage(
				json.states.map((i) => DirectiveState.from(i)),
			);
		} catch (error) {
			throw new Error(
				`Cannot deserialize a list message from JSON: ${JSON.stringify(json, undefined, 2)}`,
				{cause: error},
			);
		}
	}

	readonly _type = 'ListMessage';

	constructor(readonly states: DirectiveState[]) {}
}
