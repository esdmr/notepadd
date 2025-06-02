import parseDataUrl from 'data-urls';
import type * as hast from 'hast';
import type * as mdast from 'mdast';
import {parseSrcset} from 'srcset';
import {stringToUint8Array} from 'uint8array-extras';
import * as yaml from 'yaml';
import * as v from 'valibot';
import {filterNullishValues, mapRecord} from '../utils.ts';
import {
	getLastCell,
	getLastOutput,
	type NotePadd,
	type NotePaddMetadata,
} from './types.ts';
import {html, markdown} from './parsers.ts';
import {cellDirective, executionDirective, outputDirective} from './shared.ts';
import {getMimeTypeOfMarkdownLang} from './mime.ts';

function addOutput(
	context: NotePadd,
	mimeType: string,
	body: Uint8Array | string,
): void {
	getLastOutput(context).items[mimeType] =
		typeof body === 'string' ? stringToUint8Array(body) : body;
}

function addOutputUri(context: NotePadd, source: string): void {
	const media = parseDataUrl(source);
	if (media) addOutput(context, media.mimeType.essence, media.body);
}

function addOutputHtml(context: NotePadd, node: hast.RootContent): void {
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
function addOutputMarkdown(context: NotePadd, node: mdast.RootContent): void {
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
				// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
				node.meta || getMimeTypeOfMarkdownLang(node.lang),
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

function deserializeAttributeMetadata(
	// eslint-disable-next-line @typescript-eslint/ban-types
	attributes: Record<string, string | null | undefined> | null | undefined,
): NotePaddMetadata | undefined {
	try {
		return mapRecord(filterNullishValues(attributes ?? {}), ([k, v]) => [
			k,
			JSON.parse(v) as unknown,
		]);
	} catch (error) {
		// FIXME: Do not use console directly.
		console.error(
			'[NotePADD/.np.md/Deserializer]',
			'Invalid metadata JSON ignored.',
			error,
		);
	}
}

const metadataSchema = v.record(v.string(), v.unknown());

function deserializeCodeMetadata(
	meta: string | undefined,
): NotePaddMetadata | undefined {
	if (!meta) return;

	try {
		return v.parse(metadataSchema, JSON.parse(meta));
	} catch (error) {
		// FIXME: Do not use console directly.
		console.error(
			'[NotePADD/.np.md/Deserializer]',
			'Invalid metadata JSON ignored.',
			error,
		);
	}
}

// eslint-disable-next-line complexity
function addCell(context: NotePadd, node: mdast.RootContent): void {
	switch (node.type) {
		case 'code': {
			context.cells.push({
				type: 'code',
				lang: node.lang ?? 'plaintext',
				source: node.value,
				metadata: deserializeCodeMetadata(node.meta ?? undefined),
			});

			return;
		}

		case 'yaml': {
			context.metadata = yaml.parse(node.value) as NotePaddMetadata;
			return;
		}

		case 'leafDirective': {
			if (node.name === cellDirective) {
				// TODO: Remove this branch for v1. `cell` was switched to a
				// container directive.
				getLastCell(context).metadata = deserializeAttributeMetadata(
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
			} = deserializeAttributeMetadata(node.attributes) ?? {};

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
			if (node.name === cellDirective) {
				context.cells.push({
					type: 'markup',
					lang: 'markdown',
					source: markdown.stringify({
						type: 'root',
						children: node.children,
					}),
					metadata: deserializeAttributeMetadata(node.attributes),
				});

				return;
			}

			if (node.name !== outputDirective) break;

			const lastCell = getLastCell(context);

			lastCell.outputs ??= [];
			lastCell.outputs.push({
				items: {},
				metadata: deserializeAttributeMetadata(node.attributes),
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

export function deserializeNotePadd(content: string | Uint8Array): NotePadd {
	const context: NotePadd = {
		cells: [],
	};

	for (const child of markdown.parse(content).children) {
		addCell(context, child);
	}

	return context;
}
