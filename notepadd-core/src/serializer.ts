import type * as hast from 'hast';
import type * as mdast from 'mdast';
import {
	stringToBase64,
	stringToUint8Array,
	uint8ArrayToBase64,
	uint8ArrayToString,
} from 'uint8array-extras';
import * as yaml from 'yaml';
import {
	builtinLangIdOfMimeTypes,
	cellDirective,
	executionDirective,
	html,
	markdown,
	outputDirective,
} from './parsers.ts';
import type {NotePadd, NotePaddCell, NotePaddOutput} from './types.ts';
import {filterNullishValues, mapObject} from './utils.ts';

function ord(ch: string) {
	return ch.codePointAt(0)!;
}

const uriSafeChars = new Set([
	// From RFC 2396:
	//     uric = reserved | unreserved | escaped
	//     unreserved = alphanum | mark
	//     alphanum = alpha | digit
	//     alpha = lowalpha | upalpha

	// `reserved`:
	ord(';'),
	ord('/'),
	ord('?'),
	ord(':'),
	ord('@'),
	ord('&'),
	ord('='),
	ord('+'),
	ord('$'),
	ord(','),

	// `lowalpha`:
	...Array.from({length: 26}, (_, i) => i + ord('a')),

	// `upalpha`:
	...Array.from({length: 26}, (_, i) => i + ord('A')),

	// `digit`:
	...Array.from({length: 10}, (_, i) => i + ord('0')),

	// `mark`:
	ord('-'),
	ord('_'),
	ord('.'),
	ord('!'),
	ord('~'),
	ord('*'),
	ord("'"),
	ord('('),
	ord(')'),
]);

/**
 * @see {@link uriSafeChars}
 */
const uriSafeRegExp = /^[;/?:@&=+$,a-zA-Z0-9-_.!~*'()]*$/u;

function isUriSafe(body: Uint8Array | string) {
	return typeof body === 'string'
		? uriSafeRegExp.test(body)
		: body.every((i) => uriSafeChars.has(i));
}

function isBinary(body: Uint8Array | string) {
	return typeof body === 'string' ? body.includes('\0') : body.includes(0);
}

function toOutputUri(mimeType: string, body: Uint8Array | string) {
	if (isUriSafe(body)) {
		return `data:${mimeType},${typeof body === 'string' ? body : uint8ArrayToString(body)}`;
	}

	return `data:${mimeType};base64,${typeof body === 'string' ? stringToBase64(body) : uint8ArrayToBase64(body)}`;
}

function toOutputHtml(
	items: Record<string, Uint8Array>,
	type: 'audio' | 'image' | 'video',
): hast.RootContent {
	if (type === 'image') {
		const children = Object.entries(items).map<hast.Element>(([k, v]) => ({
			type: 'element',
			tagName: 'source',
			properties: {
				srcSet: toOutputUri(k, v),
				type: k,
			},
			children: [],
		}));

		const lastChild = children.at(-1);

		if (lastChild) {
			lastChild.tagName = 'img';
			lastChild.properties.src = lastChild.properties.srcSet;
			lastChild.properties.alt = '';
			delete lastChild.properties.type;
			delete lastChild.properties.srcSet;
		}

		return {
			type: 'element',
			tagName: 'picture',
			properties: {},
			children,
		};
	}

	return {
		type: 'element',
		tagName: type,
		properties: {
			controls: true,
		},
		children: Object.entries(items).map<hast.Element>(([k, v]) => ({
			type: 'element',
			tagName: 'source',
			properties: {
				src: toOutputUri(k, v),
				type: k,
			},
			children: [],
		})),
	};
}

function toOutput(output: NotePaddOutput): mdast.RootContent {
	const audio: Record<string, Uint8Array> = {};
	const image: Record<string, Uint8Array> = {};
	const video: Record<string, Uint8Array> = {};
	const text: Record<string, Uint8Array> = {};
	const binary: Record<string, Uint8Array> = {};

	for (const [k, v] of Object.entries(output.items)) {
		const mimeType = k.split('/', 1)[0]!;

		switch (mimeType) {
			case 'audio': {
				audio[k] = v;
				break;
			}

			case 'video': {
				video[k] = v;
				break;
			}

			case 'image': {
				image[k] = v;
				break;
			}

			default: {
				if (isBinary(v)) {
					binary[k] = v;
				} else {
					text[k] = v;
				}
			}
		}
	}

	const children: Array<mdast.BlockContent | mdast.DefinitionContent> = [];

	for (const [items, type] of [
		[audio, 'audio'],
		[image, 'image'],
		[video, 'video'],
	] as const) {
		if (Object.keys(items).length > 0) {
			children.push({
				type: 'html',
				value: html.stringify({
					type: 'root',
					children: [toOutputHtml(items, type)],
				}),
			});
		}
	}

	for (const [k, v] of Object.entries(text)) {
		children.push({
			type: 'code',
			lang:
				builtinLangIdOfMimeTypes[k] ??
				`${k.split('/', 2)[1]?.split('+', 2)[1] ?? 'plaintext'} ${k}`,
			value: typeof v === 'string' ? v : uint8ArrayToString(v),
		});
	}

	for (const [k, v] of Object.entries(binary)) {
		children.push({
			type: 'paragraph',
			children: [
				{
					type: 'link',
					url: toOutputUri(k, v),
					children: [
						{
							type: 'text',
							value: k,
						},
					],
				},
			],
		});
	}

	return {
		type: 'containerDirective',
		name: outputDirective,
		attributes: mapObject(
			filterNullishValues(output.metadata ?? {}),
			([k, v]) => [k, JSON.stringify(v)],
		),
		children,
	};
}

function toCell(md: mdast.Root, cell: NotePaddCell) {
	if (cell.type === 'code') {
		md.children.push({type: 'code', lang: cell.lang, value: cell.source});
	} else {
		md.children.push(...markdown.parse(cell.source).children);
	}

	const metadata = mapObject(
		filterNullishValues(cell.metadata ?? {}),
		([k, v]) => [k, JSON.stringify(v)],
	);

	if (Object.keys(metadata).length > 0) {
		md.children.push({
			type: 'leafDirective',
			name: cellDirective,
			children: [],
			attributes: metadata,
		});
	}

	const executionSummary = mapObject(
		filterNullishValues({
			order: cell.executionSummary?.executionOrder,
			success: cell.executionSummary?.success,
			start: cell.executionSummary?.timing?.startTime,
			end: cell.executionSummary?.timing?.endTime,
		}),
		([k, v]) => [k, JSON.stringify(v)],
	);

	if (Object.keys(executionSummary).length > 0) {
		md.children.push({
			type: 'leafDirective',
			name: executionDirective,
			children: [],
			attributes: executionSummary,
		});
	}

	for (const output of cell.outputs ?? []) {
		md.children.push(toOutput(output));
	}
}

export function serializeNotePadd(data: NotePadd) {
	const md: mdast.Root = {
		type: 'root',
		children: [],
	};

	if (data.metadata) {
		md.children.push({
			type: 'yaml',
			value: yaml.stringify(data.metadata).trimEnd(),
		});
	}

	for (const cell of data.cells) {
		toCell(md, cell);
	}

	return stringToUint8Array(markdown.stringify(md));
}
