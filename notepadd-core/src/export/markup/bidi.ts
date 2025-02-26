import bidiFactory from 'bidi-js';
import type {PhrasingContent} from 'mdast';
import type {TextDirective} from 'mdast-util-directive';

const bidi = bidiFactory();

export class BidiNode implements TextDirective {
	readonly type = 'textDirective';
	readonly name: 'ltr' | 'rtl';
	readonly children: PhrasingContent[] = [];

	constructor(
		readonly level: number,
		readonly parent?: BidiNode,
	) {
		this.name = level % 2 === 0 ? 'ltr' : 'rtl';
	}

	// eslint-disable-next-line @typescript-eslint/naming-convention
	toJSON() {
		return {...this, parent: undefined};
	}
}

function adjustBidiLevel(cursor: BidiNode, newLevel: number) {
	while (cursor.level > newLevel) {
		if (!cursor.parent) {
			throw new RangeError(
				'Tried to adjust bidi level to below the root node',
			);
		}

		cursor = cursor.parent;
	}

	if (cursor.level < newLevel) {
		const newNode = new BidiNode(newLevel, cursor);
		cursor.children.push(newNode);
		cursor = newNode;
	}

	return cursor;
}

const isolatePlaceholder = '-';

export function generateBidiNode(
	nodes: readonly PhrasingContent[],
	baseDirection?: 'ltr' | 'rtl' | 'auto',
) {
	const text = nodes
		.map((i) => (i.type === 'text' ? i.value : isolatePlaceholder))
		.join('');

	const {levels} = bidi.getEmbeddingLevels(text, baseDirection);

	const root = new BidiNode(levels.includes(0) ? 0 : 1);
	let cursor = root;
	let offset = 0;

	for (const node of nodes) {
		if (node.type !== 'text') {
			cursor = adjustBidiLevel(cursor, levels[offset]!);
			cursor.children.push(node);
			offset += isolatePlaceholder.length;
			continue;
		}

		for (const char of node.value) {
			cursor = adjustBidiLevel(cursor, levels[offset]!);
			const lastChild = cursor.children.at(-1);

			if (lastChild?.type === 'text') {
				lastChild.value += char;
			} else {
				cursor.children.push({type: 'text', value: char});
			}

			offset += char.length;
		}
	}

	return root;
}
