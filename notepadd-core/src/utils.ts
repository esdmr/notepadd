/* eslint-disable @typescript-eslint/ban-types */
import MIMEType from 'whatwg-mimetype';
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

export function mapObject<
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

const builtinLangIdOfMimeTypes = mapObject(
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
