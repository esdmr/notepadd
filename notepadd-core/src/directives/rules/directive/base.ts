import {type Temporal} from 'temporal-polyfill';
import {hasProperty, hasTypeBrand, includes, isObject} from '../../../utils.ts';
import type {Directive} from './types.ts';

export const validInstanceStates = ['pulse', 'high', 'low'] as const;
export type ValidInstanceState = (typeof validInstanceStates)[number];

export class Instance {
	// `from` static method was moved from here. See `instanceFrom` in
	// `./types.ts`.

	readonly _type = 'Instance';

	constructor(
		readonly directive: Directive,
		readonly previous: Temporal.ZonedDateTime | undefined,
		readonly next: Temporal.ZonedDateTime | undefined,
		readonly currentState: ValidInstanceState = 'pulse',
	) {}
}

export type DirectiveChild = {
	getInstance(now: Temporal.ZonedDateTime, directive: Directive): Instance;
	getNextInstance(instance: Instance): Instance;
	getLabel(): string | undefined;
	toString(): string;
};
