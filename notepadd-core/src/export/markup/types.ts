import type {AlignType, Definition, FootnoteDefinition} from 'mdast';
import type {NotePadd} from '../../format/types.ts';

export type {AlignType} from 'mdast';

export type NotePaddExportContext = {
	readonly notebook: NotePadd;
	readonly links: Map<string, Definition>;
	readonly footnotes: Map<string, FootnoteDefinition>;
	readonly direction: 'ltr' | 'rtl';

	readonly global: {
		hasTitle: boolean;
	};
};

export type NotePaddExportFormatTypes = {
	Context: NotePaddExportContext;
	Root: unknown;
	Block: unknown;
	Phrasing: unknown;
	Item: unknown;
	Row: unknown;
	Cell: unknown;
};

export type NotePaddExportFormat<T extends NotePaddExportFormatTypes> = {
	onRoot(
		context: T['Context'],
		getChildren: (context: T['Context']) => Array<T['Block']>,
	): T['Root'];

	onBlockquote(
		context: T['Context'],
		getChildren: (context: T['Context']) => Array<T['Block']>,
	): T['Block'];

	onCode(
		context: T['Context'],
		source: string,
		language: string | undefined,
	): T['Block'];

	onTitle(
		context: T['Context'],
		getTitle: (context: T['Context']) => Array<T['Phrasing']>,
		getAuthors: (context: T['Context']) => Array<Array<T['Phrasing']>>,
	): T['Block'];

	onHeading(
		context: T['Context'],
		depth: 2 | 3 | 4 | 5 | 6,
		getChildren: (context: T['Context']) => Array<T['Phrasing']>,
	): T['Block'];

	onParagraph(
		context: T['Context'],
		getChildren: (context: T['Context']) => Array<T['Phrasing']>,
	): T['Block'];

	onThematicBreak(context: T['Context']): T['Block'];

	onMath(context: T['Context'], source: string): T['Block'];

	onRtl(
		context: T['Context'],
		getChildren: (context: T['Context']) => Array<T['Block']>,
	): T['Block'];

	onLtr(
		context: T['Context'],
		getChildren: (context: T['Context']) => Array<T['Block']>,
	): T['Block'];

	onListItem(
		context: T['Context'],
		checked: boolean | undefined,
		getChildren: (context: T['Context']) => Array<T['Block']>,
	): T['Item'];

	onList(
		context: T['Context'],
		start: number | undefined,
		getChildren: (context: T['Context']) => Array<T['Item']>,
	): T['Block'];

	onTableCell(
		context: T['Context'],
		getChildren: (context: T['Context']) => Array<T['Phrasing']>,
	): T['Cell'];

	onTableRow(
		context: T['Context'],
		getChildren: (context: T['Context']) => Array<T['Cell']>,
	): T['Row'];

	onTable(
		context: T['Context'],
		align: Array<NonNullable<AlignType>>,
		getChildren: (context: T['Context']) => Array<T['Row']>,
	): T['Block'];

	onBreak(context: T['Context']): T['Phrasing'];

	onDelete(
		context: T['Context'],
		getChildren: (context: T['Context']) => Array<T['Phrasing']>,
	): T['Phrasing'];

	onEmphasis(
		context: T['Context'],
		getChildren: (context: T['Context']) => Array<T['Phrasing']>,
	): T['Phrasing'];

	onFootnote(
		context: T['Context'],
		getChildren: (context: T['Context']) => Array<T['Block']>,
	): T['Phrasing'];

	onImage(
		context: T['Context'],
		alt: string | undefined,
		url: string,
		title: string | undefined,
	): T['Phrasing'];

	onRawImage(
		context: T['Context'],
		alt: string | undefined,
		content: Uint8Array,
		mime: string,
		title: string | undefined,
	): T['Phrasing'];

	onInlineCode(context: T['Context'], source: string): T['Phrasing'];

	onLink(
		context: T['Context'],
		url: string,
		title: string | undefined,
		getChildren: (context: T['Context']) => Array<T['Phrasing']>,
	): T['Phrasing'];

	onStrong(
		context: T['Context'],
		getChildren: (context: T['Context']) => Array<T['Phrasing']>,
	): T['Phrasing'];

	onInlineRtl(
		context: T['Context'],
		getChildren: (context: T['Context']) => Array<T['Phrasing']>,
	): T['Phrasing'];

	onInlineLtr(
		context: T['Context'],
		getChildren: (context: T['Context']) => Array<T['Phrasing']>,
	): T['Phrasing'];

	onText(context: T['Context'], content: string): T['Phrasing'];

	onInlineMath(context: T['Context'], source: string): T['Phrasing'];
};
