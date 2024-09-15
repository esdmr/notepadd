import parseDataUrl from 'data-urls';
import type * as hast from 'hast';
import type * as mdast from 'mdast';
import {parseSrcset} from 'srcset';
import type {JsonValue} from 'type-fest';
import {stringToUint8Array} from 'uint8array-extras';
import * as yaml from 'yaml';
import {
	cellDirective,
	executionDirective,
	html,
	markdown,
	outputDirective,
} from './parsers.ts';
import type {NotePadd, NotePaddMetadata} from './types.ts';
import {
	filterNullishValues,
	getLastCell,
	getLastOutput,
	getMimeTypeOfMarkdownLang,
	mapRecord,
} from './utils.ts';

function addOutput(
	context: NotePadd,
	mimeType: string,
	body: Uint8Array | string,
) {
	getLastOutput(context).items[mimeType] =
		typeof body === 'string' ? stringToUint8Array(body) : body;
}

function addOutputUri(context: NotePadd, source: string) {
	const media = parseDataUrl(source);
	if (media) addOutput(context, media.mimeType.essence, media.body);
}

function addOutputHtml(context: NotePadd, node: hast.RootContent) {
	if (node.type !== 'element') return;

	switch (node.tagName) {
		case 'html':
		case 'body': {
			for (const child of node.children) {
				addOutputHtml(context, child);
			}

			break;
		}

		case 'source':
		case 'img':
		case 'audio':
		case 'video':
		case 'picture': {
			const {srcSet, src} = node.properties;
			const sources = [];

			if (typeof srcSet === 'string') {
				sources.push(...parseSrcset(srcSet).map((i) => i.url));
			}

			if (typeof src === 'string') {
				sources.push(src);
			}

			for (const i of sources) addOutputUri(context, i);

			for (const child of node.children) {
				addOutputHtml(context, child);
			}

			break;
		}

		default:
	}
}

// eslint-disable-next-line complexity
function addOutputMarkdown(context: NotePadd, node: mdast.RootContent) {
	switch (node.type) {
		case 'html': {
			const root = html.parse(node.value);

			for (const i of root.children) {
				addOutputHtml(context, i);
			}

			break;
		}

		case 'code': {
			addOutput(
				context,
				getMimeTypeOfMarkdownLang(node.lang),
				node.value,
			);
			break;
		}

		case 'image':
		case 'link': {
			addOutputUri(context, node.url);
			break;
		}

		case 'paragraph': {
			for (const child of node.children) {
				addOutputMarkdown(context, child);
			}

			break;
		}

		case 'blockquote':
		case 'definition':
		case 'footnoteDefinition':
		case 'heading':
		case 'list':
		case 'table':
		case 'thematicBreak':
		case 'containerDirective':
		case 'leafDirective':
		case 'math':
		case 'break':
		case 'delete':
		case 'emphasis':
		case 'footnoteReference':
		case 'imageReference':
		case 'inlineCode':
		case 'linkReference':
		case 'listItem':
		case 'strong':
		case 'tableCell':
		case 'tableRow':
		case 'text':
		case 'yaml':
		case 'textDirective':
		case 'inlineMath':
	}
}

function deserializeMetadata(
	// eslint-disable-next-line @typescript-eslint/ban-types
	attributes: Record<string, string | null | undefined> | null | undefined,
) {
	return mapRecord(filterNullishValues(attributes ?? {}), ([k, v]) => [
		k,
		JSON.parse(v) as JsonValue,
	]);
}

// eslint-disable-next-line complexity
function addCell(context: NotePadd, node: mdast.RootContent) {
	switch (node.type) {
		case 'code': {
			context.cells.push({
				type: 'code',
				lang: node.lang ?? 'plaintext',
				source: node.value,
			});

			return;
		}

		case 'yaml': {
			context.metadata = yaml.parse(node.value) as NotePaddMetadata;
			return;
		}

		case 'leafDirective': {
			if (node.name === cellDirective) {
				getLastCell(context).metadata = deserializeMetadata(
					node.attributes,
				);

				return;
			}

			if (node.name !== executionDirective) break;

			const {
				order,
				success,
				start: startTime,
				end: endTime,
			} = deserializeMetadata(node.attributes);

			const timing =
				typeof startTime === 'number' && typeof endTime === 'number'
					? {startTime, endTime}
					: undefined;

			getLastCell(context).executionSummary = {
				executionOrder: typeof order === 'number' ? order : undefined,
				success: typeof success === 'boolean' ? success : undefined,
				timing,
			};

			return;
		}

		case 'containerDirective': {
			if (node.name !== outputDirective) break;

			const lastCell = getLastCell(context);

			lastCell.outputs ??= [];
			lastCell.outputs.push({
				items: {},
				metadata: deserializeMetadata(node.attributes),
			});

			for (const child of node.children) {
				addOutputMarkdown(context, child);
			}

			return;
		}

		case 'textDirective':
		case 'blockquote':
		case 'break':
		case 'definition':
		case 'delete':
		case 'emphasis':
		case 'footnoteDefinition':
		case 'footnoteReference':
		case 'heading':
		case 'html':
		case 'image':
		case 'imageReference':
		case 'inlineCode':
		case 'link':
		case 'linkReference':
		case 'list':
		case 'listItem':
		case 'paragraph':
		case 'strong':
		case 'table':
		case 'tableCell':
		case 'tableRow':
		case 'text':
		case 'thematicBreak':
		case 'inlineMath':
		case 'math': {
			break;
		}
	}

	context.cells.push({
		type: 'markup',
		lang: 'markdown',
		source: markdown.stringify({
			type: 'root',
			children: [node],
		}),
	});
}

export function deserializeNotePadd(content: Uint8Array): NotePadd {
	const context: NotePadd = {
		cells: [],
	};

	for (const child of markdown.parse(content).children) {
		addCell(context, child);
	}

	return context;
}
