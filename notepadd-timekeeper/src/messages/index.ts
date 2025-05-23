import {getDiscriminator, transformFallible} from 'notepadd-core';
import * as v from 'valibot';
import {DiscoveryMessage} from './discovery.ts';
import {ListMessage} from './list.ts';
import {LogMessage} from './log.ts';
import {TerminateMessage} from './terminate.ts';
import {TriggerMessage} from './trigger.ts';
import {UpdateMessage} from './update.ts';

export * from './discovery.ts';
export * from './list.ts';
export * from './log.ts';
export * from './terminate.ts';
export * from './trigger.ts';
export * from './update.ts';

export type TimekeeperMessageChild =
	| DiscoveryMessage
	| TriggerMessage
	| LogMessage
	| ListMessage;

export class TimekeeperMessage {
	static readonly schema = v.pipe(
		v.object({
			_type: v.literal('TimekeeperMessage'),
			message: v.variant('_type', [
				DiscoveryMessage.schema,
				TriggerMessage.schema,
				LogMessage.schema,
				ListMessage.schema,
			]),
		}),
		transformFallible((i) => new TimekeeperMessage(i.message)),
	);

	readonly _type = getDiscriminator(TimekeeperMessage);

	constructor(readonly message: TimekeeperMessageChild) {}
}

export type BookkeeperMessageChild = UpdateMessage | TerminateMessage;

export class BookkeeperMessage {
	static readonly schema = v.pipe(
		v.object({
			_type: v.literal('BookkeeperMessage'),
			message: v.variant('_type', [
				UpdateMessage.schema,
				TerminateMessage.schema,
			]),
		}),
		transformFallible((i) => new BookkeeperMessage(i.message)),
	);

	readonly _type = getDiscriminator(BookkeeperMessage);

	constructor(readonly message: BookkeeperMessageChild) {}
}
