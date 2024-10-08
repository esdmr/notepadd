import {Temporal} from 'temporal-polyfill';
import {
	Directive,
	hasProperty,
	hasTypeBrand,
	Instance,
	isObject,
} from 'notepadd-core';

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

			if (!hasProperty(json, 'directive')) {
				throw new TypeError('Directive is invalid');
			}

			if (!hasProperty(json, 'instance')) {
				throw new TypeError('Instance is invalid');
			}

			return new TriggerMessage(
				Directive.from(json.directive),
				Instance.from(json.instance),
			);
		} catch (error) {
			throw new Error(
				`Cannot deserialize a trigger message from JSON: ${JSON.stringify(json, undefined, 2)}`,
				{cause: error},
			);
		}
	}

	readonly _type = 'TriggerMessage';

	constructor(
		readonly directive: Directive,
		readonly instance: Instance,
	) {}
}
