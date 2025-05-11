import * as v from 'valibot';
import {getDiscriminator, transformFallible} from '../../../../utils.ts';

export class Reference {
	static readonly schema = v.pipe(
		v.object({
			_type: v.literal('Reference'),
			target: v.string(),
		}),
		transformFallible((i) => new Reference(i.target)),
	);

	readonly _type = getDiscriminator(Reference);
	declare readonly getInstance: undefined;
	declare readonly getNextInstance: undefined;

	constructor(readonly target: string) {}

	toString() {
		return `reference <${this.target}>`;
	}
}
