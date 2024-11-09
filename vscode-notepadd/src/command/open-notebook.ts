import {
	commands,
	NotebookRange,
	Uri,
	window,
	workspace,
	type NotebookDocumentShowOptions,
} from 'vscode';

export function setupOpenNotebookCommand() {
	return commands.registerCommand(
		'notepadd.openNotebook',
		async (fileUrl: string) => {
			const uri = Uri.parse(fileUrl, true);

			const cellIndex = uri.fragment.startsWith('C')
				? Number.parseInt(uri.fragment.slice(1), 10)
				: -1;

			const options: NotebookDocumentShowOptions = {
				preview: true,
				selections:
					Number.isSafeInteger(cellIndex) && cellIndex >= 0
						? [new NotebookRange(cellIndex, cellIndex + 1)]
						: undefined,
			};

			const document = await workspace.openNotebookDocument(
				uri.with({fragment: ''}),
			);
			await window.showNotebookDocument(document, options);
		},
	);
}
