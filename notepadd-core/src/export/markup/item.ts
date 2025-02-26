import type {ListContent, ListItem} from 'mdast';
import {exportMarkdownBlockNodes} from './block.ts';
import type {NotePaddExportFormat, NotePaddExportFormatTypes} from './types.ts';

export function exportMarkdownItemNode<T extends NotePaddExportFormatTypes>(
	node: ListContent,
	format: NotePaddExportFormat<T>,
	context: T['Context'],
): T['Item'] {
	// There is only one kind of item node. No need for a switch statement.
	node satisfies ListItem;

	return format.onListItem(context, node.checked ?? undefined, (context) =>
		exportMarkdownBlockNodes(node.children, format, context),
	);
}
