import type {Directive, Instance} from 'notepadd-core';
import {type Temporal} from 'temporal-polyfill';
import {onTimeout} from './timeout.ts';

export class FileContext {
	constructor(
		readonly sources: ReadonlyMap<string, Directive>,
		readonly hashes: ReadonlyMap<string, Directive>,
	) {}
}

export class DirectiveContext {
	lastTimeout: ReturnType<typeof setTimeout> | undefined;
	instance: Instance;
	referenceCount = 1;
	readonly onTimeout = onTimeout.bind(this);

	constructor(
		readonly directive: Directive,
		now: Temporal.ZonedDateTime,
	) {
		this.instance = directive.getInstance(now);
	}
}

export class UpdateDelta {
	constructor(
		readonly deleted: ReadonlyMap<string, Directive> = new Map(),
		readonly added: ReadonlyMap<string, Directive> = new Map(),
	) {}
}
