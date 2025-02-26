import type {TableContent, TableRow} from 'mdast';
import {exportMarkdownCellNode} from './cell.ts';
import type {NotePaddExportFormat, NotePaddExportFormatTypes} from './types.ts';

export function exportMarkdownRowNode<T extends NotePaddExportFormatTypes>(
	node: TableContent,
	format: NotePaddExportFormat<T>,
	context: T['Context'],
): T['Row'] {
	// There is only one kind of row node. No need for a switch statement.
	node satisfies TableRow;

	return format.onTableRow(context, (context) =>
		node.children.map((i) => exportMarkdownCellNode(i, format, context)),
	);
}
