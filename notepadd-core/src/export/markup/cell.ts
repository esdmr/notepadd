import type {RowContent, TableCell} from 'mdast';
import {exportMarkdownPhrasingNodes} from './phrasing.ts';
import type {NotePaddExportFormat, NotePaddExportFormatTypes} from './types.ts';

export function exportMarkdownCellNode<T extends NotePaddExportFormatTypes>(
	node: RowContent,
	format: NotePaddExportFormat<T>,
	context: T['Context'],
): T['Cell'] {
	// There is only one kind of cell node. No need for a switch statement.
	node satisfies TableCell;

	return format.onTableCell(context, (context) =>
		exportMarkdownPhrasingNodes(node.children, format, context),
	);
}
