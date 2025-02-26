import type {PhrasingContent, Root, RootContent} from 'mdast';
import {html, htmlToMarkdown} from '../../format/parsers.ts';
import {generateBidiNode} from './bidi.ts';
import {exportMarkdownBlockNodes} from './block.ts';
import type {NotePaddExportFormat, NotePaddExportFormatTypes} from './types.ts';

// eslint-disable-next-line complexity
export function exportMarkdownPhrasingNode<T extends NotePaddExportFormatTypes>(
	node: PhrasingContent,
	format: NotePaddExportFormat<T>,
	context: T['Context'],
): Array<T['Phrasing']> {
	switch (node.type) {
		case 'break': {
			return [format.onBreak(context)];
		}

		case 'delete': {
			return [
				format.onDelete(context, (context) =>
					exportMarkdownPhrasingNodes(node.children, format, context),
				),
			];
		}

		case 'emphasis': {
			return [
				format.onEmphasis(context, (context) =>
					exportMarkdownPhrasingNodes(node.children, format, context),
				),
			];
		}

		case 'footnoteReference': {
			const definition = context.footnotes?.get(node.identifier);

			if (!definition) {
				return exportMarkdownPhrasingNodes(
					[
						{type: 'text', value: '['},
						{
							type: 'emphasis',
							children: [
								{
									type: 'textDirective',
									name: 'ltr',
									children: [
										{
											type: 'text',
											value: 'Footnote missing.',
										},
									],
								},
							],
						},
						{type: 'text', value: ']'},
					],
					format,
					context,
				);
			}

			return [
				format.onFootnote(context, (context) =>
					exportMarkdownBlockNodes(
						definition.children,
						format,
						context,
					),
				),
			];
		}

		case 'html': {
			return exportMarkdownInlineNode(
				htmlToMarkdown.runSync(html.parse(node.value)),
				format,
				context,
			);
		}

		case 'image': {
			return [
				format.onImage(
					context,
					node.alt ?? undefined,
					node.url,
					node.title ?? undefined,
				),
			];
		}

		case 'imageReference': {
			const definition = context.links?.get(node.identifier);

			if (!definition) {
				return exportMarkdownPhrasingNodes(
					[
						{type: 'text', value: '['},
						{
							type: 'emphasis',
							children: [
								{
									type: 'textDirective',
									name: 'ltr',
									children: [
										{
											type: 'text',
											value: 'Image missing.',
										},
									],
								},
							],
						},
						{type: 'text', value: ']'},
					],
					format,
					context,
				);
			}

			return [
				format.onImage(
					context,
					node.alt ?? undefined,
					definition.url,
					definition.title ?? undefined,
				),
			];
		}

		case 'inlineCode': {
			if (context.direction !== 'ltr') {
				return exportMarkdownPhrasingNode(
					{type: 'textDirective', name: 'ltr', children: [node]},
					format,
					context,
				);
			}

			return [format.onInlineCode(context, node.value)];
		}

		case 'link': {
			return [
				format.onLink(
					context,
					node.url,
					node.title ?? undefined,
					(context) =>
						exportMarkdownPhrasingNodes(
							node.children,
							format,
							context,
						),
				),
			];
		}

		case 'linkReference': {
			const definition = context.links?.get(node.identifier);

			if (!definition) {
				return exportMarkdownPhrasingNodes(
					[
						...node.children,
						{type: 'text', value: ' ['},
						{
							type: 'emphasis',
							children: [
								{
									type: 'textDirective',
									name: 'ltr',
									children: [
										{
											type: 'text',
											value: 'Link missing.',
										},
									],
								},
							],
						},
						{type: 'text', value: ']'},
					],
					format,
					context,
				);
			}

			return [
				format.onLink(
					context,
					definition.url,
					definition.title ?? undefined,
					(context) =>
						exportMarkdownPhrasingNodes(
							node.children,
							format,
							context,
						),
				),
			];
		}

		case 'strong': {
			return [
				format.onStrong(context, (context) =>
					exportMarkdownPhrasingNodes(node.children, format, context),
				),
			];
		}

		case 'text': {
			return [format.onText(context, node.value)];
		}

		case 'textDirective': {
			if (node.name === context.direction) {
				return exportMarkdownPhrasingNodes(
					node.children,
					format,
					context,
					true,
				);
			}

			if (node.name === 'ltr') {
				return [
					format.onInlineLtr(context, (context) =>
						exportMarkdownPhrasingNodes(
							node.children,
							format,
							{...context, direction: 'ltr'},
							true,
						),
					),
				];
			}

			if (node.name === 'rtl') {
				return [
					format.onInlineRtl(context, (context) =>
						exportMarkdownPhrasingNodes(
							node.children,
							format,
							{...context, direction: 'rtl'},
							true,
						),
					),
				];
			}

			return exportMarkdownPhrasingNodes(
				[
					{type: 'text', value: '['},
					{
						type: 'emphasis',
						children: [
							{
								type: 'textDirective',
								name: 'ltr',
								children: [
									{
										type: 'text',
										value: 'Unknown text directive',
									},
								],
							},
						],
					},
					{type: 'text', value: ' '},
					{type: 'inlineCode', value: node.name},
					{type: 'text', value: '.]'},
				],
				format,
				context,
			);
		}

		case 'inlineMath': {
			return [format.onInlineMath(context, node.value)];
		}
	}
}

export function exportMarkdownPhrasingNodes<
	T extends NotePaddExportFormatTypes,
>(
	nodes: PhrasingContent[],
	format: NotePaddExportFormat<T>,
	context: T['Context'],
	skipBidi = false,
): Array<T['Phrasing']> {
	if (skipBidi) {
		return nodes.flatMap((i) =>
			exportMarkdownPhrasingNode(i, format, context),
		);
	}

	return exportMarkdownPhrasingNode(
		generateBidiNode(nodes, context.direction),
		format,
		context,
	);
}

// eslint-disable-next-line complexity
export function exportMarkdownInlineNode<T extends NotePaddExportFormatTypes>(
	node: Root | RootContent,
	format: NotePaddExportFormat<T>,
	context: T['Context'],
): Array<T['Phrasing']> {
	switch (node.type) {
		case 'yaml':
		case 'definition':
		case 'footnoteDefinition':
		case 'thematicBreak': {
			return [];
		}

		case 'code': {
			return exportMarkdownPhrasingNode(
				{type: 'inlineCode', value: node.value},
				format,
				context,
			);
		}

		case 'math': {
			return exportMarkdownPhrasingNode(
				{type: 'inlineMath', value: node.value},
				format,
				context,
			);
		}

		case 'root':
		case 'blockquote':
		case 'heading':
		case 'list':
		case 'paragraph':
		case 'table':
		case 'containerDirective':
		case 'leafDirective':
		case 'listItem':
		case 'tableCell':
		case 'tableRow': {
			return node.children.flatMap((i) =>
				exportMarkdownInlineNode(i, format, context),
			);
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
		case 'inlineMath':
		case 'html': {
			return exportMarkdownPhrasingNode(node, format, context);
		}
	}
}
