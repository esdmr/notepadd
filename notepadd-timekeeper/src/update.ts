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
import {CellState, DirectiveState, UpdateDelta} from './types.ts';

const files = new Map<string, CellState[]>();
const directives = new Map<string, DirectiveState>();

function* updateFile(fileUrl: string, content: string): Generator<UpdateDelta> {
	const states = files.get(fileUrl) ?? [];
	files.set(fileUrl, states);

	if (!content) {
		files.delete(fileUrl);

		for (const [index, state] of states?.entries() ?? []) {
			yield new UpdateDelta(fileUrl, index, state.hashes, new Map());
		}

		return;
	}

	const notebook = deserializeNotePadd(content);

	for (const [index, cell] of notebook.cells.entries()) {
		const state = states[index];

		const sources = new Map<string, Directive>();
		const hashes = new Map<string, Directive>();

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

		const newState = new CellState(sources, hashes);
		states[index] = newState;

		if (!state) {
			yield new UpdateDelta(fileUrl, index, new Map(), hashes);
			continue;
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

		yield new UpdateDelta(fileUrl, index, deleted, added);
	}

	for (let index = notebook.cells.length; index < states.length; index++) {
		yield new UpdateDelta(fileUrl, index, states[index]!.hashes, new Map());
	}

	states.length = notebook.cells.length;
}

function applyUpdateDelta(delta: UpdateDelta, now: Temporal.ZonedDateTime) {
	for (const [hash] of delta.deleted) {
		const state = directives.get(hash);
		if (!state) continue;

		state.sources.delete(delta.source);
		if (state.sources.size > 0) continue;

		state.clearTimeout();
		directives.delete(hash);
	}

	for (const [hash, added] of delta.added) {
		const oldState = directives.get(hash);

		if (oldState) {
			oldState.sources.add(delta.source);
			continue;
		}

		const state = new DirectiveState(
			added,
			added.getInstance(now),
			new Set([delta.source]),
		);
		directives.set(hash, state);
		onTimeout(state);
	}
}

export function processUpdate(message: UpdateMessage) {
	const now = Temporal.Now.zonedDateTimeISO();

	for (const [fileUrl, content] of Object.entries(message.changed)) {
		try {
			for (const delta of updateFile(fileUrl, content)) {
				applyUpdateDelta(delta, now);
			}
		} catch (error) {
			output.error(error);
		}
	}

	if (message.partial) return;

	for (const fileUrl of directives.keys()) {
		if (Object.hasOwn(message.changed, fileUrl)) continue;

		try {
			for (const delta of updateFile(fileUrl, '')) {
				applyUpdateDelta(delta, now);
			}
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
