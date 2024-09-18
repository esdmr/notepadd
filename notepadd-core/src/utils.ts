/* eslint-disable @typescript-eslint/ban-types */
import MIMEType from 'whatwg-mimetype';
import {Temporal} from 'temporal-polyfill';
import type {NotePadd, NotePaddCell, NotePaddOutput} from './types.ts';

export function isNullish(value: unknown): value is null | undefined {
	return value === null || value === undefined;
}

export function filterNullishValues<K extends PropertyKey, V>(
	object: Record<K, V | null | undefined>,
) {
	return Object.fromEntries(
		Object.entries(object).filter((i) => !isNullish(i[1])),
	) as Record<K, V>;
}

export function filterRecord<
	K1 extends PropertyKey,
	V1,
	K2 extends K1,
	V2 extends V1,
>(
	object: Record<K1, V1>,
	predicate: (entry: [K1, V1]) => entry is [K2, V2],
): Record<K2, V2>;

export function filterRecord<K extends PropertyKey, V>(
	object: Record<K, V>,
	predicate: (entry: [K, V]) => unknown,
): Record<K, V>;

export function filterRecord(
	object: Record<PropertyKey, unknown>,
	predicate: (entry: [PropertyKey, unknown]) => unknown,
) {
	return Object.fromEntries(
		Object.entries(object).filter((i) => predicate(i)),
	);
}

export function mapRecord<
	K1 extends PropertyKey,
	V1,
	K2 extends PropertyKey,
	V2,
>(object: Record<K1, V1>, mapper: (entry: [K1, V1]) => [K2, V2]) {
	return Object.fromEntries(
		Object.entries(object).map((i) => mapper(i as [K1, V1])),
	) as Record<K2, V2>;
}

export function getLastCell(context: NotePadd) {
	const lastCell = context.cells.at(-1);
	if (lastCell) return lastCell;

	const dummyCell: NotePaddCell = {
		type: 'markup',
		lang: 'markdown',
		source: '',
	};

	context.cells.push(dummyCell);
	return dummyCell;
}

export function getLastOutput(context: NotePadd) {
	const lastCell = getLastCell(context);
	lastCell.outputs ??= [];

	const lastOutput = lastCell.outputs.at(-1);
	if (lastOutput) return lastOutput;

	const dummyOutput: NotePaddOutput = {
		items: {},
	};

	lastCell.outputs.push(dummyOutput);
	return dummyOutput;
}

const builtinMimeTypeOfLangIds: Record<string, string> = {
	html: 'text/html',
	svg: 'image/svg+xml',
	markdown: 'text/markdown',
	plaintext: 'text/plain',
	json: 'application/json',
	error: 'application/vnd.code.notebook.error',
	stderr: 'application/vnd.code.notebook.stderr',
	stdout: 'application/vnd.code.notebook.stdout',
	notepadd: 'application/x-notepadd+json',
};

export function getMimeTypeOfLangId(langId: string) {
	return builtinMimeTypeOfLangIds[langId] ?? `text/x-${langId}`;
}

export function getMimeTypeOfMarkdownLang(mdLang: string | null | undefined) {
	const [langId = 'plaintext', mime] = mdLang?.split(' ', 2) ?? [];

	return mime ?? getMimeTypeOfLangId(langId);
}

const builtinLangIdOfMimeTypes = mapRecord(
	builtinMimeTypeOfLangIds,
	([k, v]) => [v, k],
);

const mimeSubTypeLangIdRegExp = /^(?:x[-.]|vnd[-.])?(?:[^+]+\+)*([^+]+)$/;

export function getLangIdOfMimeType(mime: string) {
	const mimeType = new MIMEType(mime);

	return (
		builtinLangIdOfMimeTypes[mimeType.essence] ??
		mimeSubTypeLangIdRegExp.exec(mimeType.subtype)?.[1] ??
		mimeType.subtype
	);
}

export function getMarkdownLangOfMimeType(mime: string) {
	const langId = getLangIdOfMimeType(mime);

	return getMimeTypeOfLangId(langId) === mime ? langId : `${langId} ${mime}`;
}

export function codePointOf(ch: string) {
	return ch.codePointAt(0)!;
}

export const uriSafeChars = new Set([
	// From RFC 2396:
	//     uric = reserved | unreserved | escaped
	//     unreserved = alphanum | mark
	//     alphanum = alpha | digit
	//     alpha = lowalpha | upalpha

	// `reserved`:
	codePointOf(';'),
	codePointOf('/'),
	codePointOf('?'),
	codePointOf(':'),
	codePointOf('@'),
	codePointOf('&'),
	codePointOf('='),
	codePointOf('+'),
	codePointOf('$'),
	codePointOf(','),

	// `lowalpha`:
	...Array.from({length: 26}, (_, i) => i + codePointOf('a')),

	// `upalpha`:
	...Array.from({length: 26}, (_, i) => i + codePointOf('A')),

	// `digit`:
	...Array.from({length: 10}, (_, i) => i + codePointOf('0')),

	// `mark`:
	codePointOf('-'),
	codePointOf('_'),
	codePointOf('.'),
	codePointOf('!'),
	codePointOf('~'),
	codePointOf('*'),
	codePointOf("'"),
	codePointOf('('),
	codePointOf(')'),
]);

/**
 * @see {@link uriSafeChars}
 */
const uriSafeRegExp = /^[;/?:@&=+$,a-zA-Z0-9-_.!~*'()]*$/u;

export function isUriSafe(body: Uint8Array | string) {
	return typeof body === 'string'
		? uriSafeRegExp.test(body)
		: body.every((i) => uriSafeChars.has(i));
}

export function isBinary(body: Uint8Array | string) {
	return typeof body === 'string' ? body.includes('\0') : body.includes(0);
}

export function getSmallestDurationUnit(duration: Temporal.Duration) {
	if (duration.nanoseconds !== 0) return 'nanoseconds';
	if (duration.microseconds !== 0) return 'microseconds';
	if (duration.milliseconds !== 0) return 'milliseconds';
	if (duration.seconds !== 0) return 'seconds';
	if (duration.minutes !== 0) return 'minutes';
	if (duration.hours !== 0) return 'hours';
	if (duration.days !== 0) return 'days';
	if (duration.weeks !== 0) return 'weeks';
	if (duration.months !== 0) return 'months';
	return 'years';
}

export function multiplyDuration(
	duration: Temporal.Duration,
	coefficient: number,
) {
	return coefficient === 1
		? duration
		: new Temporal.Duration(
				duration.years * coefficient,
				duration.months * coefficient,
				duration.weeks * coefficient,
				duration.days * coefficient,
				duration.hours * coefficient,
				duration.minutes * coefficient,
				duration.seconds * coefficient,
				duration.milliseconds * coefficient,
				duration.microseconds * coefficient,
				duration.nanoseconds * coefficient,
			);
}

export function minDuration(
	one: Temporal.Duration,
	two: Temporal.Duration,
	relativeTo: Temporal.ZonedDateTime,
) {
	return Temporal.Duration.compare(one, two, {relativeTo}) < 0 ? one : two;
}
