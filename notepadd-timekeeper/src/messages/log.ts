import {getDiscriminator, transformFallible} from 'notepadd-core';
import * as v from 'valibot';

export const logLevelSchema = v.picklist([
	'trace',
	'debug',
	'info',
	'warn',
	'error',
]);

export type LogLevel = v.InferOutput<typeof logLevelSchema>;

export class LogMessage {
	static readonly schema = v.pipe(
		v.object({
			_type: v.literal('LogMessage'),
			level: logLevelSchema,
			items: v.array(v.any()),
		}),
		transformFallible((i) => new LogMessage(i.level, i.items)),
	);

	readonly _type = getDiscriminator(LogMessage);

	constructor(
		readonly level: LogLevel,
		readonly items: readonly unknown[],
	) {}
}
