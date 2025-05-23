import type {DefinitionContent, Root, RootContent} from 'mdast';
import type {NotePaddExportContext} from './types.ts';

export function collectMarkdownDefinitionNode(
	node: Root | RootContent,
	context: NotePaddExportContext,
): void {
	if ('children' in node) {
		for (const child of node.children) {
			collectMarkdownDefinitionNode(child, context);
		}
	}

	// Note: `node` is *not* just a `DefinitionContent`. By defining it this
	// way, the linter can ensure that we are not skipping any definition nodes,
	// without using `default` for the rest.
	const definition = node as DefinitionContent satisfies RootContent;

	switch (definition.type) {
		case 'definition': {
			context.links.set(definition.identifier, definition);
			break;
		}

		case 'footnoteDefinition': {
			context.footnotes.set(definition.identifier, definition);
			break;
		}
	}
}
