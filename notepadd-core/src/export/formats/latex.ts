import escapeLatex from 'escape-latex';
import {stringToUint8Array} from 'uint8array-extras';
import {getContentDigest} from '../../digest.ts';
import type {NotePadd} from '../../format/types.ts';
import {createExportContext, exportNotebook} from '../markup/index.ts';
import {
	type AlignType,
	type NotePaddExportContext,
	type NotePaddExportFormat,
} from '../markup/types.ts';

const latexHeadings = [
	'section',
	'subsection',
	'subsubsection',
	'paragraph',
	'subparagraph',
];

const latexAlignments: Record<NonNullable<AlignType>, string> = {
	left: 'l',
	center: 'c',
	right: 'r',
};

function joinBlockNodes(nodes: string[]) {
	return nodes.join('\n\n');
}

function joinPhrasingNodes(nodes: string[]) {
	return nodes.join('');
}

export type NotePaddExportLatexFile =
	| {type: 'raw'; content: Uint8Array}
	| {type: 'image'; url: string}
	| {type: 'rawImage'; content: Uint8Array; mime: string};

type NotePaddExportLatexContext = NotePaddExportContext & {
	readonly packages: {
		amssymb?: boolean;
		booktabs?: boolean;
		enumitem?: boolean;
		hyperref?: boolean;
		listings?: boolean;
		mathtools?: boolean;
		ulem?: boolean;
		graphicx?: boolean;
	};

	readonly definitions: {
		thmbrk?: boolean;
		strng?: boolean;
		rl?: boolean;
		lr?: boolean;
		lre?: boolean;
		rtl?: boolean;
		ltr?: boolean;
		title?: string;
		author?: string;
	};

	readonly files: Map<string, NotePaddExportLatexFile>;
	readonly moving: boolean;
	readonly basename: string;
};

function shouldOverwrite(
	oldFile: NotePaddExportLatexFile | undefined,
	newFile: NotePaddExportLatexFile,
) {
	if (!oldFile) return true;
	if (
		oldFile.type !== 'raw' ||
		newFile.type !== 'raw' ||
		newFile.content.byteLength !== oldFile.content.byteLength
	) {
		return false;
	}

	for (let i = 0; i < newFile.content.byteLength; i++) {
		if (newFile.content[i] !== oldFile.content[i]) return false;
	}

	return true;
}

function addFileByDigest(
	context: NotePaddExportLatexContext,
	file: NotePaddExportLatexFile,
	prefix = '',
	suffix = '',
) {
	let content;

	switch (file.type) {
		case 'raw':
		case 'rawImage': {
			content = file.content;
			break;
		}

		case 'image': {
			content = stringToUint8Array(file.url);
			break;
		}
	}

	for (const digest of getContentDigest(content)) {
		const filename =
			context.basename +
			'/' +
			(prefix && prefix + '.') +
			digest +
			(suffix && '.' + suffix);

		if (shouldOverwrite(context.files.get(filename), file)) {
			context.files.set(filename, file);
			return filename;
		}
	}
}

const latexExportFormat: NotePaddExportFormat<{
	Context: NotePaddExportLatexContext;
	Block: string;
	Cell: string;
	Item: string;
	Phrasing: string;
	Root: Map<string, NotePaddExportLatexFile>;
	Row: string;
}> = {
	// eslint-disable-next-line complexity
	onRoot(context, getChildren) {
		const body = joinBlockNodes(getChildren(context));

		const useXepersian = /^fa(?:$|-)/i.test(
			String(context.notebook.metadata?.lang),
		);

		const useBidi =
			useXepersian ||
			context.direction === 'rtl' ||
			Boolean(context.definitions.rl) ||
			Boolean(context.definitions.rtl);

		let preamble = `\\documentclass[a4paper]{article}\n\n`;

		for (const i of Object.keys(context.packages)) {
			preamble += `\\usepackage${i === 'ulem' ? '[normalem]' : ''}{${i}}\n`;
		}

		if (useXepersian) {
			preamble += `\\usepackage{xepersian}\n`;
		} else if (useBidi) {
			const options = context.direction === 'rtl' ? '[RTLdocument]' : '';

			preamble += `\\usepackage${options}{bidi}\n`;
		}

		preamble += '\n';

		if (context.definitions.thmbrk) {
			preamble +=
				'\\newcommand{\\thmbrk}{\\begin{center}* * *\\end{center}}\n';
		}

		if (context.definitions.strng) {
			preamble += '\\DeclareTextFontCommand{\\strng}{\\bfseries}\n';
		}

		if (!useXepersian && context.definitions.rl) {
			const target = useBidi ? '\\RLE' : '\\empty';
			preamble += `\\let \\rl ${target}\n`;
		}

		if (!useXepersian && context.definitions.lr) {
			const target = useBidi ? '\\LRE' : '\\empty';
			preamble += `\\let \\lr ${target}\n`;
		}

		if (!useBidi && context.definitions.lre) {
			preamble += `\\let \\LRE \\empty\n`;
		}

		if (context.definitions.rtl) {
			const begin = useXepersian
				? '\\begin{persian}'
				: useBidi
					? '\\begin{RTL}'
					: '';

			const end = useXepersian
				? '\\end{persian}'
				: useBidi
					? '\\end{RTL}'
					: '';

			preamble += `\\newenvironment{rtl}{${begin}}{${end}}\n`;
		}

		if (context.definitions.ltr) {
			const begin = useXepersian
				? '\\begin{latin}'
				: useBidi
					? '\\begin{LTR}'
					: '';

			const end = useXepersian
				? '\\end{latin}'
				: useBidi
					? '\\end{LTR}'
					: '';

			preamble += `\\newenvironment{ltr}{${begin}}{${end}}\n`;
		}

		if (context.packages.listings) {
			preamble +=
				'\\lstset{basicstyle=\\ttfamily, columns=fullflexible}\n';
		}

		if (useXepersian) {
			preamble += `\\settextfont{XB Yas}\n`;
			preamble += `\\setmathdigitfont{XB Yas}\n`;
		}

		if (context.definitions.title) {
			preamble += `\\title{${context.definitions.title}}\n`;
		}

		if (context.definitions.author) {
			preamble += `\\author{${context.definitions.author}}\n`;
		}

		context.files.set(`${context.basename}.tex`, {
			type: 'raw',
			content: stringToUint8Array(
				`${preamble}\n\\begin{document}\n${
					useXepersian && context.direction === 'ltr'
						? `\\begin{latin}\n${body}\n\\end{latin}`
						: body
				}\n\\end{document}\n`,
			),
		});

		return context.files;
	},
	onBlockquote(context, getChildren) {
		return `\\begin{quote}\n${joinBlockNodes(
			getChildren(context),
		)}\n\\end{quote}`;
	},
	onCode(context, source, language) {
		context.packages.listings = true;

		if (context.moving) {
			return `\\lstinputlisting{${addFileByDigest(
				context,
				{type: 'raw', content: stringToUint8Array(source)},
				language ?? 'code',
				'txt',
			)}}`;
		}

		return `\\begin{lstlisting}\n${source.replaceAll('\\end', '\\end\u{200B}')}\n\\end{lstlisting}`;
	},
	onTitle(context, getTitle, getAuthors) {
		context.definitions.title = joinPhrasingNodes(
			getTitle({
				...context,
				moving: true,
			}),
		);

		const authors = getAuthors({
			...context,
			moving: true,
		}).map((i) => joinPhrasingNodes(i));

		if (authors.length > 0) {
			context.definitions.author = authors.join('\\and{}');
		}

		return `\\maketitle`;
	},
	onHeading(context, depth, getChildren) {
		return `\\${latexHeadings[depth - 2]!}{${joinPhrasingNodes(
			getChildren({
				...context,
				moving: true,
			}),
		)}}`;
	},
	onParagraph(context, getChildren) {
		return joinPhrasingNodes(getChildren(context));
	},
	onThematicBreak(context) {
		context.definitions.thmbrk = true;

		return `\\thmbrk`;
	},
	onMath(context, source) {
		context.packages.mathtools = true;
		context.packages.amssymb = true;

		return `\\begin{gather}\n${source}\n\\end{gather}`;
	},
	onRtl(context, getChildren) {
		context.definitions.rtl = true;

		return `\\begin{rtl}\n${joinBlockNodes(getChildren({...context, direction: 'rtl'}))}\n\\end{rtl}`;
	},
	onLtr(context, getChildren) {
		context.definitions.ltr = true;

		return `\\begin{ltr}\n${joinBlockNodes(getChildren({...context, direction: 'ltr'}))}\n\\end{ltr}`;
	},
	onListItem(context, checked, getChildren) {
		// TODO: Support task items.
		return `\\item ${joinBlockNodes(getChildren(context))}`;
	},
	onList(context, start, getChildren) {
		const content = getChildren(context).join('\n');

		switch (start) {
			case undefined: {
				return `\\begin{itemize}\n${content}\n\\end{itemize}`;
			}

			case 1: {
				return `\\begin{enumerate}\n${content}\n\\end{enumerate}`;
			}

			default: {
				context.packages.enumitem = true;

				return `\\begin{enumerate}[start=${start}]\n${content}\n\\end{enumerate}`;
			}
		}
	},
	onTableCell(context, getChildren) {
		return joinPhrasingNodes(getChildren(context));
	},
	onTableRow(context, getChildren) {
		return `${getChildren(context).join(' & ')} \\\\`;
	},
	onTable(context, align, getChildren) {
		context.packages.booktabs = true;

		const content = getChildren(context);

		const body =
			content.length > 1
				? `\\midrule\n${content.slice(1).join('\n')}\n`
				: '';

		return `\\begin{center}\n\\begin{tabular}{${align.map((i) => latexAlignments[i]).join('')}}\n\\toprule\n${content[0]}\n${
			body
		}\\bottomrule\n\\end{tabular}\n\\end{center}`;
	},
	onBreak(context) {
		return `\\\\`;
	},
	onDelete(context, getChildren) {
		context.packages.ulem = true;

		return `\\sout{${joinPhrasingNodes(getChildren({...context, moving: true}))}}`;
	},
	onEmphasis(context, getChildren) {
		return `\\emph{${joinPhrasingNodes(getChildren({...context, moving: true}))}}`;
	},
	onFootnote(context, getChildren) {
		return `\\footnote{${joinBlockNodes(getChildren({...context, moving: true}))}}`;
	},
	onImage(context, alt, url, title) {
		context.packages.graphicx = true;

		const match = /(?:^|\/)([^./?#]+)(?:\.[^/?#]+)?(?:$|[?#])/.exec(url);
		const options = alt ? `[alt={${escapeLatex(alt)}}]` : '';

		return `\\includegraphics${options}{${addFileByDigest(
			context,
			{type: 'image', url},
			match?.[1] ?? 'image',
		)}}`;
	},
	// eslint-disable-next-line max-params
	onRawImage(context, alt, content, mime, title) {
		context.packages.graphicx = true;

		const options = alt ? `[alt={${escapeLatex(alt)}}]` : '';

		return `\\includegraphics${options}{${addFileByDigest(
			context,
			{type: 'rawImage', content, mime},
			'image',
		)}}`;
	},
	onInlineCode(context, source) {
		context.packages.listings = true;

		// TODO: Try different symbols before falling back to splitting.
		const command = source
			.split('|')
			.map((i) => `\\lstinline|${i}|`)
			.join('\\lstinline=|=');

		return context.moving
			? `\\input{${addFileByDigest(
					context,
					{type: 'raw', content: stringToUint8Array(command)},
					'code',
					'part.tex',
				)}}`
			: command;
	},
	onLink(context, url, title, getChildren) {
		context.packages.hyperref = true;
		url = encodeURI(decodeURI(url));

		return `\\href{${context.moving ? escapeLatex(url) : url}}{${joinPhrasingNodes(getChildren({...context, moving: true}))}}`;
	},
	onStrong(context, getChildren) {
		context.definitions.strng = true;

		return `\\strng{${joinPhrasingNodes(getChildren({...context, moving: true}))}}`;
	},
	onInlineRtl(context, getChildren) {
		context.definitions.rl = true;

		return `\\rl{${joinPhrasingNodes(getChildren({...context, direction: 'rtl', moving: true}))}}`;
	},
	onInlineLtr(context, getChildren) {
		const content = joinPhrasingNodes(
			getChildren({
				...context,
				direction: 'ltr',
				moving: true,
			}),
		);

		// Edge case: Numerals are mostly LTR. However, when using XePersian,
		// bidi contexts have different fonts, of which the default LTR font
		// (Latin Modern) does not support persian numerals. Additionally,
		// numerals do not need explicit bidi marking. Therefore, if an inline
		// LTR context contains only numerals, we should unwrap it, so it will
		// have the same font as the surrounding RTL text.
		if (/^\p{N}+$/u.test(content)) {
			return content;
		}

		// Edge case: Same as above, but since there are some punctuation marks,
		// we will be more careful and wrap it in an LTR embed. Also, `.` breaks
		// the LTR flow, so we must wrap it in braces. (I do not know why.)
		if (/^[\p{N}\p{Po}]+$/u.test(content)) {
			context.definitions.lre = true;

			return `\\LRE{${content.replaceAll('.', '{.}')}}`;
		}

		context.definitions.lr = true;

		return `\\lr{${content}}`;
	},
	onText(context, content) {
		return escapeLatex(content);
	},
	onInlineMath(context, source) {
		context.packages.mathtools = true;
		context.packages.amssymb = true;

		return `\\(${source}\\)`;
	},
};

export function exportNotebookToLatex(
	notebook: NotePadd,
	basename: string,
): Map<string, NotePaddExportLatexFile> {
	return exportNotebook(latexExportFormat, {
		...createExportContext(notebook),
		packages: {},
		definitions: {},
		files: new Map(),
		moving: false,
		basename,
	});
}
