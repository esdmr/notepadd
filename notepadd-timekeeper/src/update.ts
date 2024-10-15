import {
	deserializeNotePadd,
	directiveMimeType,
	deserializeDirective,
	type Directive,
} from 'notepadd-core';
import {uint8ArrayToString} from 'uint8array-extras';
import {Temporal} from 'temporal-polyfill';
import {output} from './output.ts';
import {DirectiveContext, FileContext, UpdateDelta} from './types.ts';
import type { UpdateMessage } from './messages/update.ts';

const files = new Map<string, FileContext>();
const directives = new Map<string, DirectiveContext>();

function updateFile(key: string, content: string): UpdateDelta {
	const context = files.get(key);

	if (!content) {
		files.delete(key);
		const deleted = context?.hashes ?? new Map();
		return new UpdateDelta(deleted);
	}

	const sources = new Map(
		deserializeNotePadd(content)
			.cells.flatMap((i, cellIndex) =>
				i.outputs?.map((i) => {
					try {
						const output = i.items[directiveMimeType];
						if (!output) return;

						const text = uint8ArrayToString(output);

						return [
							text,
							context?.sources.get(text) ??
								deserializeDirective(text, key, cellIndex),
						] as const;
					} catch (error) {
						output.error(error);
						return undefined;
					}
				}),
			)
			.filter((i) => i !== undefined),
	);

	const hashes = new Map([...sources.values()].map((i) => [i.toString(), i]));

	const newContext = new FileContext(sources, hashes);
	files.set(key, newContext);

	if (!context) {
		return new UpdateDelta(undefined, hashes);
	}

	const added = new Map<string, Directive>();
	const deleted = new Map<string, Directive>();

	for (const [hash, directive] of context.hashes) {
		if (!hashes.has(hash)) {
			deleted.set(hash, directive);
		}
	}

	for (const [hash, directive] of hashes) {
		if (!context.hashes.has(hash)) {
			added.set(hash, directive);
		}
	}

	return new UpdateDelta(deleted, added);
}

function applyUpdateDelta(
	delta: UpdateDelta,
	now: Temporal.ZonedDateTime,
) {
	for (const [hash] of delta.deleted) {
		const context = directives.get(hash);
		if (!context) continue;

		context.referenceCount--;
		if (context.referenceCount > 0) continue;

		if (context.lastTimeout) {
			clearTimeout(context.lastTimeout);
		}

		directives.delete(hash);
	}

	for (const [hash, directive] of delta.added) {
		const oldContext = directives.get(hash);

		if (oldContext) {
			oldContext.referenceCount++;
			continue;
		}

		const context = new DirectiveContext(directive, now);
		directives.set(hash, context);
		context.onTimeout();
	}
}

export function processUpdate(message: UpdateMessage) {
	const now = Temporal.Now.zonedDateTimeISO();

	for (const [key, content] of Object.entries(message.changed)) {
		try {
			const delta = updateFile(key, content);
			applyUpdateDelta(delta, now);
		} catch (error) {
			output.error(error);
		}
	}

	if (message.partial) return;

	for (const key of directives.keys()) {
		if (Object.hasOwn(message.changed, key)) continue;

		try {
			const delta = updateFile(key, '');
			applyUpdateDelta(delta, now);
		} catch (error) {
			output.error(error);
		}
	}
}

export function resetTimeouts() {
	for (const [_hash, directive] of directives) {
		if (directive.lastTimeout) clearTimeout(directive.lastTimeout);
		directive.onTimeout();
	}
}

export function getInstances() {
	return Array.from(directives.values(), (i) => i.instance);
}
