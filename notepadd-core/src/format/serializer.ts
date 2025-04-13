import type * as hast from 'hast';
import type * as mdast from 'mdast';
import {stringifySrcset} from 'srcset';
import {
	stringToBase64,
	stringToUint8Array,
	uint8ArrayToBase64,
	uint8ArrayToString,
} from 'uint8array-extras';
import MIMEType from 'whatwg-mimetype';
import * as yaml from 'yaml';
import {filterNullishValues, isBinary, isUriSafe, mapRecord} from '../utils.ts';
import {html, markdown} from './parsers.ts';
import {cellDirective, executionDirective, outputDirective} from './shared.ts';
import type {
	NotePadd,
	NotePaddCell,
	NotePaddMetadata,
	NotePaddOutput,
} from './types.ts';
import {getLangIdOfMimeType} from './mime.ts';

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
	const entries = Object.entries(items);

	if (type === 'image') {
		return {
			type: 'element',
			tagName: 'img',
			properties: {
				src:
					entries.length > 0
						? toOutputUri(...entries[0]!)
						: undefined,
				srcSet:
					entries.length > 1
						? stringifySrcset(
								entries.slice(1).map(([k, v]) => ({
									url: toOutputUri(k, v),
								})),
							)
						: undefined,
				alt: '',
			},
			children: [],
		};
	}

	return {
		type: 'element',
		tagName: type,
		properties: {
			controls: true,
		},
		children: entries.map<hast.Element>(([k, v]) => ({
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

function toAttributeMetadata(metadata: NotePaddMetadata | undefined) {
	return mapRecord(filterNullishValues(metadata ?? {}), ([k, v]) => [
		k,
		JSON.stringify(v),
	]);
}

function toCodeMetadata(metadata: NotePaddMetadata | undefined) {
	return JSON.stringify(metadata);
}

function toOutput(output: NotePaddOutput): mdast.RootContent {
	const audio: Record<string, Uint8Array> = {};
	const image: Record<string, Uint8Array> = {};
	const video: Record<string, Uint8Array> = {};
	const text: Record<string, Uint8Array> = {};
	const binary: Record<string, Uint8Array> = {};

	for (const [k, v] of Object.entries(output.items)) {
		const mimeType = new MIMEType(k);

		switch (mimeType.type) {
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
			lang: getLangIdOfMimeType(k),
			meta: k,
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
		attributes: toAttributeMetadata(output.metadata),
		children,
	};
}

function* toCell(
	cell: NotePaddCell,
): Generator<mdast.RootContent, void, undefined> {
	if (cell.type === 'code') {
		yield {
			type: 'code',
			lang: cell.lang || 'plaintext',
			value: cell.source,
			meta: toCodeMetadata(cell.metadata),
		};
	} else {
		const {children} = markdown.parse(cell.source);
		const metadata = toAttributeMetadata(cell.metadata);

		yield children.length === 1 &&
		children[0]!.type !== 'code' &&
		Object.keys(metadata).length === 0
			? children[0]!
			: {
					type: 'containerDirective',
					name: cellDirective,
					children: children as Array<
						mdast.BlockContent | mdast.DefinitionContent
					>,
					attributes: metadata,
				};
	}

	const executionSummary = toAttributeMetadata({
		order: cell.executionSummary?.executionOrder,
		success: cell.executionSummary?.success,
		start: cell.executionSummary?.timing?.startTime,
		end: cell.executionSummary?.timing?.endTime,
	});

	if (Object.keys(executionSummary).length > 0) {
		yield {
			type: 'leafDirective',
			name: executionDirective,
			children: [],
			attributes: executionSummary,
		};
	}

	for (const output of cell.outputs ?? []) {
		yield toOutput(output);
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
		for (const child of toCell(cell)) {
			md.children.push(child);
		}
	}

	return stringToUint8Array(markdown.stringify(md));
}
