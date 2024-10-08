import {hasProperty, hasTypeBrand, includes, isObject} from 'notepadd-core';

export const logLevels = ['trace', 'debug', 'info', 'warn', 'error'] as const;
export type LogLevel = (typeof logLevels)[number];

export class LogMessage {
	static from(json: unknown) {
		try {
			if (!isObject(json)) {
				throw new TypeError('Message is not an object');
			}

			if (
				!hasTypeBrand(json, 'LogMessage' satisfies LogMessage['_type'])
			) {
				throw new TypeError('Object is not a log message');
			}

			if (
				!hasProperty(json, 'level') ||
				!includes(logLevels, json.level)
			) {
				throw new TypeError('Log level is invalid');
			}

			if (!hasProperty(json, 'items') || !Array.isArray(json.items)) {
				throw new TypeError('Log items are invalid');
			}

			return new LogMessage(json.level, json.items);
		} catch (error) {
			throw new Error(
				`Cannot deserialize a log message from JSON: ${JSON.stringify(json, undefined, 2)}`,
				{cause: error},
			);
		}
	}

	readonly _type = 'LogMessage';

	constructor(
		readonly level: LogLevel,
		readonly items: readonly unknown[],
	) {}
}
