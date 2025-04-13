import {uint8ArrayToString} from 'uint8array-extras';
import MIMEType from 'whatwg-mimetype';
import * as v from 'valibot';
import {
	deserializeDirective,
	directiveMimeType,
} from '../../directives/index.ts';
import {getLangIdOfMimeType} from '../../format/mime.ts';
import {html, htmlToMarkdown, markdown} from '../../format/parsers.ts';
import type {
	NotePadd,
	NotePaddCell,
	NotePaddOutput,
} from '../../format/types.ts';
import {
	createSystemMessage,
	exportMarkdownBlockNode,
	exportMarkdownBlockNodes,
	exportMarkdownNode,
} from './block.ts';
import {collectMarkdownDefinitionNode} from './definition.ts';
import type {
	NotePaddExportContext,
	NotePaddExportFormat,
	NotePaddExportFormatTypes,
} from './types.ts';

const errorOutputSchema = v.object({
	name: v.optional(v.string()),
	message: v.optional(v.string()),
	stack: v.optional(v.string()),
});

function exportNotebookErrorOutput<T extends NotePaddExportFormatTypes>(
	content: Uint8Array,
	format: NotePaddExportFormat<T>,
	context: T['Context'],
): Array<T['Block']> {
	let error;

	try {
		error = v.parse(
			errorOutputSchema,
			JSON.parse(uint8ArrayToString(content)),
		);
	} catch {
		return exportMarkdownBlockNodes(
			createSystemMessage('Invalid error output.'),
			format,
			context,
		);
	}

	if (error.stack) {
		return exportMarkdownBlockNode(
			{type: 'code', value: error.stack},
			format,
			context,
		);
	}

	const message =
		error.name && error.message
			? `${error.name}: ${error.message}`
			: // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
				error.name || error.message;

	if (!message) {
		return exportMarkdownBlockNodes(
			createSystemMessage('Blank error output.'),
			format,
			context,
		);
	}

	return exportMarkdownBlockNode(
		{type: 'code', value: message},
		format,
		context,
	);
}

function exportNotebookOutput<T extends NotePaddExportFormatTypes>(
	output: NotePaddOutput,
	format: NotePaddExportFormat<T>,
	context: T['Context'],
): Array<T['Block']> {
	let content: Uint8Array | undefined;

	if ((content = output.items[directiveMimeType])) {
		// TODO: Improve directive output.
		const directive = deserializeDirective(uint8ArrayToString(content));

		return exportMarkdownBlockNodes(
			createSystemMessage(
				'Directive: ',
				{type: 'text', value: directive.getLabel() ?? '(Untitled)'},
				'.',
			),
			format,
			context,
		);
	}

	if ((content = output.items['text/markdown'])) {
		return exportMarkdownNode(markdown.parse(content), format, context);
	}

	if ((content = output.items['text/html'])) {
		return exportMarkdownNode(
			htmlToMarkdown.runSync(html.parse(content)),
			format,
			context,
		);
	}

	// FIXME: Support non-image media

	for (const mime of format.preferredImageMimeTypes) {
		let content: Uint8Array | undefined;

		if ((content = output.items[mime])) {
			// TODO: Replace paragraph with a figure.
			// TODO: Do not use format directly.
			return [
				format.onParagraph(context, (context) => [
					format.onRawImage(
						context,
						undefined,
						content!,
						mime,
						undefined,
					),
				]),
			];
		}
	}

	const keys = Object.keys(output.items).filter((i) => output.items[i]);

	for (const mime of keys) {
		const mimeType = new MIMEType(mime);

		if (mimeType.type === 'image') {
			// TODO: Replace paragraph with a figure.
			// TODO: Do not use format directly.
			return [
				format.onParagraph(context, (context) => [
					format.onRawImage(
						context,
						undefined,
						output.items[mime]!,
						mime,
						undefined,
					),
				]),
			];
		}
	}

	for (const mime of keys) {
		const mimeType = new MIMEType(mime);

		if (
			mime === 'application/json' ||
			(mimeType.type === 'text' && mimeType.subtype.startsWith('x-'))
		) {
			return exportMarkdownBlockNode(
				{
					type: 'code',
					value: uint8ArrayToString(output.items[mime]!),
					lang: getLangIdOfMimeType(mime),
				},
				format,
				context,
			);
		}
	}

	if ((content = output.items['application/vnd.code.notebook.error'])) {
		return exportNotebookErrorOutput(content, format, context);
	}

	for (const mime of keys) {
		if (
			mime === 'application/vnd.code.notebook.stderr' ||
			mime === 'application/vnd.code.notebook.stdout' ||
			mime === 'text/plain'
		) {
			return exportMarkdownBlockNode(
				{
					type: 'code',
					value: uint8ArrayToString(output.items[mime]!),
				},
				format,
				context,
			);
		}
	}

	return exportMarkdownBlockNodes(
		createSystemMessage('Unknown output format.'),
		format,
		context,
	);
}

function exportNotebookCell<T extends NotePaddExportFormatTypes>(
	cell: NotePaddCell,
	format: NotePaddExportFormat<T>,
	context: T['Context'],
): Array<T['Block']> {
	if (cell.type === 'markup') {
		context.links.clear();
		context.footnotes.clear();

		const root = markdown.parse(cell.source);

		collectMarkdownDefinitionNode(root, context);
		return exportMarkdownNode(root, format, context);
	}

	if (!cell.outputs?.length) {
		return exportMarkdownBlockNode(
			{type: 'code', value: cell.source, lang: cell.lang},
			format,
			context,
		);
	}

	return cell.outputs?.flatMap((output) =>
		exportNotebookOutput(output, format, context),
	);
}

export function createExportContext(notebook: NotePadd): NotePaddExportContext {
	return {
		notebook,
		links: new Map(),
		footnotes: new Map(),
		global: {
			hasTitle: false,
		},
		direction: notebook.metadata?.dir === 'rtl' ? 'rtl' : 'ltr',
	};
}

export function exportNotebook<T extends NotePaddExportFormatTypes>(
	format: NotePaddExportFormat<T>,
	context: T['Context'],
) {
	return format.onRoot(context, (context) =>
		context.notebook.cells.flatMap((i) =>
			exportNotebookCell(i, format, context),
		),
	);
}
