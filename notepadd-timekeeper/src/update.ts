import {
	deserializeDirective,
	deserializeNotePadd,
	directiveMimeType,
	type Directive,
} from 'notepadd-core';
import {Temporal} from 'temporal-polyfill';
import {uint8ArrayToString} from 'uint8array-extras';
import type {UpdateMessage} from './messages/update.ts';
import {output} from './output.ts';
import {onTimeout} from './timeout.ts';
import {DirectiveState, FileState, UpdateDelta} from './types.ts';

const files = new Map<string, FileState>();
const directives = new Map<string, DirectiveState>();

function updateFile(fileUrl: string, content: string): UpdateDelta {
	const state = files.get(fileUrl);

	if (!content) {
		files.delete(fileUrl);
		const deleted = state?.hashes ?? new Map();
		return new UpdateDelta(fileUrl, deleted);
	}

	const sources = new Map<string, Directive>();
	const hashes = new Map<string, Directive>();

	for (const [cellIndex, cell] of deserializeNotePadd(
		content,
	).cells.entries()) {
		const cellUrl = new URL(fileUrl);
		cellUrl.hash = `C${cellIndex}`;

		for (const out of cell.outputs ?? []) {
			try {
				const content = out.items[directiveMimeType];
				if (!content) continue;

				const text = uint8ArrayToString(content);

				const directive =
					sources.get(text) ??
					state?.sources.get(text) ??
					deserializeDirective(text);

				sources.set(text, directive);
				hashes.set(directive.toString(), directive);
			} catch (error) {
				output.error(error);
			}
		}
	}

	const newState = new FileState(sources, hashes);
	files.set(fileUrl, newState);

	if (!state) {
		return new UpdateDelta(fileUrl, undefined, hashes);
	}

	const added = new Map<string, Directive>();
	const deleted = new Map<string, Directive>();

	for (const [hash, directive] of state.hashes) {
		if (!hashes.has(hash)) {
			deleted.set(hash, directive);
		}
	}

	for (const [hash, directive] of hashes) {
		if (!state.hashes.has(hash)) {
			added.set(hash, directive);
		}
	}

	return new UpdateDelta(fileUrl, deleted, added);
}

function applyUpdateDelta(delta: UpdateDelta, now: Temporal.ZonedDateTime) {
	for (const [hash] of delta.deleted) {
		const state = directives.get(hash);
		if (!state) continue;

		state.sources.delete(delta.fileUrl);
		if (state.sources.size > 0) continue;

		state.clearTimeout();
		directives.delete(hash);
	}

	for (const [hash, added] of delta.added) {
		const oldState = directives.get(hash);

		if (oldState) {
			oldState.sources.add(delta.fileUrl);
			continue;
		}

		const state = new DirectiveState(
			added,
			added.getInstance(now),
			new Set([delta.fileUrl]),
		);
		directives.set(hash, state);
		onTimeout(state);
	}
}

export function processUpdate(message: UpdateMessage) {
	const now = Temporal.Now.zonedDateTimeISO();

	for (const [fileUrl, content] of Object.entries(message.changed)) {
		try {
			const delta = updateFile(fileUrl, content);
			applyUpdateDelta(delta, now);
		} catch (error) {
			output.error(error);
		}
	}

	if (message.partial) return;

	for (const fileUrl of directives.keys()) {
		if (Object.hasOwn(message.changed, fileUrl)) continue;

		try {
			const delta = updateFile(fileUrl, '');
			applyUpdateDelta(delta, now);
		} catch (error) {
			output.error(error);
		}
	}
}

export function resetTimeouts() {
	for (const [_hash, state] of directives) {
		onTimeout(state);
	}
}

export function getDirectiveStates() {
	return [...directives.values()];
}
