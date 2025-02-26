import {uint8ArrayToString} from 'uint8array-extras';
import {markdown} from '../../format/parsers.ts';
import type {NotePadd, NotePaddCell} from '../../format/types.ts';
import {isBinary} from '../../utils.ts';
import {exportMarkdownNode} from './block.ts';
import {collectMarkdownDefinitionNode} from './definition.ts';
import type {
	NotePaddExportContext,
	NotePaddExportFormat,
	NotePaddExportFormatTypes,
} from './types.ts';

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

	return [
		...exportMarkdownNode(
			{type: 'code', value: cell.source, lang: cell.lang},
			format,
			context,
		),
		...(cell.outputs?.flatMap((output) => {
			for (const item of Object.values(output.items)) {
				// TODO: Improve output logic.
				if (!isBinary(item)) {
					return exportMarkdownNode(
						{type: 'code', value: uint8ArrayToString(item)},
						format,
						context,
					);
				}
			}

			return exportMarkdownNode(
				{
					type: 'containerDirective',
					name: 'ltr',
					children: [
						{
							type: 'paragraph',
							children: [
								{type: 'text', value: '['},
								{
									type: 'emphasis',
									children: [
										{
											type: 'text',
											value: 'Unknown output format.',
										},
									],
								},
								{type: 'text', value: ']'},
							],
						},
					],
				},
				format,
				context,
			);
		}) ?? []),
	];
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
