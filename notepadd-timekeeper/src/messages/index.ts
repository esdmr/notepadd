import {hasProperty, hasTypeBrand, isObject} from 'notepadd-core';
import {DiscoveryMessage} from './discovery.ts';
import {LogMessage} from './log.ts';
import {TerminateMessage} from './terminate.ts';
import {TriggerMessage} from './trigger.ts';
import {UpdateMessage} from './update.ts';

export * from './discovery.ts';
export * from './trigger.ts';
export * from './update.ts';

export type TimekeeperMessageChild =
	| DiscoveryMessage
	| TriggerMessage
	| LogMessage;

export class TimekeeperMessage {
	static from(json: unknown) {
		try {
			if (!isObject(json)) {
				throw new TypeError('Message is not an object');
			}

			if (
				!hasTypeBrand(
					json,
					'TimekeeperMessage' satisfies TimekeeperMessage['_type'],
				)
			) {
				throw new TypeError('Object is not a timekeeper message');
			}

			if (
				!hasProperty(json, 'message') ||
				!isObject(json.message) ||
				!hasProperty(json.message, '_type')
			) {
				throw new TypeError('Message is invalid');
			}

			let message: TimekeeperMessageChild;

			switch (json.message._type) {
				case 'DiscoveryMessage' satisfies DiscoveryMessage['_type']: {
					message = DiscoveryMessage.from(json.message);
					break;
				}

				case 'TriggerMessage' satisfies TriggerMessage['_type']: {
					message = TriggerMessage.from(json.message);
					break;
				}

				case 'LogMessage' satisfies LogMessage['_type']: {
					message = LogMessage.from(json.message);
					break;
				}

				default: {
					throw new TypeError(
						`Unknown Timekeeper message: ${JSON.stringify(json.message, undefined, 2)}`,
					);
				}
			}

			return new TimekeeperMessage(message);
		} catch (error) {
			throw new Error(
				`Cannot deserialize a Timekeeper message from JSON: ${JSON.stringify(json, undefined, 2)}`,
				{cause: error},
			);
		}
	}

	readonly _type = 'TimekeeperMessage';

	constructor(readonly message: TimekeeperMessageChild) {}
}

export type BookkeeperMessageChild = UpdateMessage | TerminateMessage;

export class BookkeeperMessage {
	static from(json: unknown) {
		try {
			if (!isObject(json)) {
				throw new TypeError('Message is not an object');
			}

			if (
				!hasTypeBrand(
					json,
					'BookkeeperMessage' satisfies BookkeeperMessage['_type'],
				)
			) {
				throw new TypeError('Object is not a bookkeeper message');
			}

			if (
				!hasProperty(json, 'message') ||
				!isObject(json.message) ||
				!hasProperty(json.message, '_type')
			) {
				throw new TypeError('Message is invalid');
			}

			let message: BookkeeperMessageChild;

			switch (json.message._type) {
				case 'UpdateMessage' satisfies UpdateMessage['_type']: {
					message = UpdateMessage.from(json.message);
					break;
				}

				case 'TerminateMessage' satisfies TerminateMessage['_type']: {
					message = TerminateMessage.from(json.message);
					break;
				}

				default: {
					throw new TypeError(
						`Unknown Bookkeeper message: ${JSON.stringify(json.message, undefined, 2)}`,
					);
				}
			}

			return new BookkeeperMessage(message);
		} catch (error) {
			throw new Error(
				`Cannot deserialize a Bookkeeper message from JSON: ${JSON.stringify(json, undefined, 2)}`,
				{cause: error},
			);
		}
	}

	readonly _type = 'BookkeeperMessage';

	constructor(readonly message: BookkeeperMessageChild) {}
}
