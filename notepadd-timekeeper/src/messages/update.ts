import {getDiscriminator, transformFallible} from 'notepadd-core';
import * as v from 'valibot';

export class UpdateMessage {
	static readonly schema = v.pipe(
		v.object({
			_type: v.literal('UpdateMessage'),
			changed: v.record(v.string(), v.string()),
			partial: v.boolean(),
			fetchRequested: v.boolean(),
		}),
		transformFallible(
			(i) => new UpdateMessage(i.changed, i.partial, i.fetchRequested),
		),
	);

	readonly _type = getDiscriminator(UpdateMessage);

	constructor(
		readonly changed: Record<string, string>,
		readonly partial: boolean,
		readonly fetchRequested: boolean,
	) {}
}
