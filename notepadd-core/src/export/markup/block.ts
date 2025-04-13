import type {
	BlockContent,
	DefinitionContent,
	PhrasingContent,
	Root,
	RootContent,
} from 'mdast';
import {html, htmlToMarkdown} from '../../format/parsers.ts';
import {exportMarkdownItemNode} from './item.ts';
import {
	createInlineSystemMessage,
	exportMarkdownPhrasingNodes,
} from './phrasing.ts';
import {exportMarkdownRowNode} from './row.ts';
import type {NotePaddExportFormat, NotePaddExportFormatTypes} from './types.ts';

export function createSystemMessage(
	...children: Parameters<typeof createInlineSystemMessage>
): BlockContent[] {
	return [
		{
			type: 'containerDirective',
			name: 'ltr',
			children: [
				{
					type: 'paragraph',
					children: createInlineSystemMessage(...children),
				},
			],
		},
	];
}

// eslint-disable-next-line complexity
export function exportMarkdownBlockNode<T extends NotePaddExportFormatTypes>(
	node: BlockContent | DefinitionContent,
	format: NotePaddExportFormat<T>,
	context: T['Context'],
): Array<T['Block']> {
	switch (node.type) {
		case 'blockquote': {
			return [
				format.onBlockquote(context, (context) =>
					exportMarkdownBlockNodes(node.children, format, context),
				),
			];
		}

		case 'code': {
			if (context.direction !== 'ltr') {
				return exportMarkdownBlockNode(
					{type: 'containerDirective', name: 'ltr', children: [node]},
					format,
					context,
				);
			}

			return [format.onCode(context, node.value, node.lang ?? undefined)];
		}

		case 'heading': {
			if (node.depth > 1 || context.global.hasTitle) {
				return [
					format.onHeading(
						context,
						node.depth === 1 ? 2 : node.depth,
						(context) =>
							exportMarkdownPhrasingNodes(
								node.children,
								format,
								context,
							),
					),
				];
			}

			context.global.hasTitle = true;

			const authors: PhrasingContent[][] = [];

			if (typeof context.notebook.metadata?.author === 'string') {
				authors.push([
					{type: 'text', value: context.notebook.metadata.author},
				]);
			} else if (
				Array.isArray(context.notebook.metadata?.author) &&
				context.notebook.metadata.author.length > 0
			) {
				authors.push([
					{
						type: 'text',
						value: String(context.notebook.metadata.author[0]),
					},
				]);

				for (const item of context.notebook.metadata.author.slice(1)) {
					authors.push([{type: 'text', value: String(item)}]);
				}
			}

			return [
				format.onTitle(
					context,
					(context) =>
						exportMarkdownPhrasingNodes(
							node.children,
							format,
							context,
						),
					(context) =>
						authors.map((i) =>
							exportMarkdownPhrasingNodes(i, format, context),
						),
				),
			];
		}

		case 'html': {
			return exportMarkdownNode(
				htmlToMarkdown.runSync(html.parse(node.value)),
				format,
				context,
			);
		}

		case 'list': {
			return [
				format.onList(
					context,
					node.ordered ? (node.start ?? 1) : undefined,
					(context) =>
						node.children.map((i) =>
							exportMarkdownItemNode(i, format, context),
						),
				),
			];
		}

		case 'paragraph': {
			return [
				format.onParagraph(context, (context) =>
					exportMarkdownPhrasingNodes(node.children, format, context),
				),
			];
		}

		case 'table': {
			const columns = Math.max(
				...node.children.map((i) => i.children.length),
			);

			if (node.children.length === 0 || columns === 0) {
				return exportMarkdownBlockNodes(
					createSystemMessage('Empty table.'),
					format,
					context,
				);
			}

			const align = node.align?.map((i) => i ?? 'center') ?? [];

			for (let i = align.length; i < columns; i++) {
				align.push('center');
			}

			return [
				format.onTable(context, align, (context) =>
					node.children.map((i) =>
						exportMarkdownRowNode(i, format, context),
					),
				),
			];
		}

		case 'thematicBreak': {
			return [format.onThematicBreak(context)];
		}

		case 'containerDirective': {
			if (node.name === context.direction) {
				return exportMarkdownBlockNodes(node.children, format, context);
			}

			if (node.name === 'ltr') {
				return [
					format.onLtr(context, (context) =>
						exportMarkdownBlockNodes(node.children, format, {
							...context,
							direction: 'ltr',
						}),
					),
				];
			}

			if (node.name === 'rtl') {
				return [
					format.onRtl(context, (context) =>
						exportMarkdownBlockNodes(node.children, format, {
							...context,
							direction: 'rtl',
						}),
					),
				];
			}

			return exportMarkdownBlockNodes(
				[
					...createSystemMessage(
						'Start of unknown container directive',
						' ',
						{type: 'inlineCode', value: node.name},
						'.',
					),
					...node.children,
					...createSystemMessage(
						'End of unknown container directive',
						' ',
						{type: 'inlineCode', value: node.name},
						'.',
					),
				],
				format,
				context,
			);
		}

		case 'leafDirective': {
			return exportMarkdownBlockNodes(
				createSystemMessage(
					'Unknown leaf directive',
					' ',
					{type: 'inlineCode', value: node.name},
					'.',
				),
				format,
				context,
			);
		}

		case 'math': {
			return [format.onMath(context, node.value)];
		}

		case 'definition':
		case 'footnoteDefinition': {
			return [];
		}
	}
}

export function exportMarkdownBlockNodes<T extends NotePaddExportFormatTypes>(
	nodes: Array<BlockContent | DefinitionContent>,
	format: NotePaddExportFormat<T>,
	context: T['Context'],
): Array<T['Block']> {
	return nodes.flatMap((i) => exportMarkdownBlockNode(i, format, context));
}

// eslint-disable-next-line complexity
export function exportMarkdownNode<T extends NotePaddExportFormatTypes>(
	node: Root | RootContent,
	format: NotePaddExportFormat<T>,
	context: T['Context'],
): Array<T['Block']> {
	switch (node.type) {
		case 'root': {
			return node.children.flatMap((i) =>
				exportMarkdownNode(i, format, context),
			);
		}

		case 'yaml': {
			// Frontmatter is already processed by `.np.md` format and therefore
			// does not appear in cells. If and when other formats are
			// implemented, cell frontmatter should not be meaningful and must
			// be skipped, to keep compatibility with the `.np.md` format.
			return [];
		}

		case 'blockquote':
		case 'code':
		case 'heading':
		case 'html':
		case 'list':
		case 'paragraph':
		case 'table':
		case 'thematicBreak':
		case 'containerDirective':
		case 'leafDirective':
		case 'math':
		case 'definition':
		case 'footnoteDefinition': {
			return exportMarkdownBlockNode(node, format, context);
		}

		case 'break':
		case 'delete':
		case 'emphasis':
		case 'footnoteReference':
		case 'image':
		case 'imageReference':
		case 'inlineCode':
		case 'link':
		case 'linkReference':
		case 'strong':
		case 'text':
		case 'textDirective':
		case 'inlineMath': {
			return exportMarkdownBlockNode(
				{
					type: 'paragraph',
					children: [node],
				},
				format,
				context,
			);
		}

		case 'listItem': {
			return exportMarkdownBlockNode(
				{
					type: 'list',
					children: [node],
				},
				format,
				context,
			);
		}

		case 'tableCell': {
			return exportMarkdownBlockNode(
				{
					type: 'table',
					children: [{type: 'tableRow', children: [node]}],
				},
				format,
				context,
			);
		}

		case 'tableRow': {
			return exportMarkdownBlockNode(
				{
					type: 'table',
					children: [node],
				},
				format,
				context,
			);
		}
	}
}
