import {deserializeNotePadd, exportNotebookToLatex} from 'notepadd-core';
import {commands, Uri, window, workspace} from 'vscode';

export function setupExportToLatexCommand() {
	return commands.registerCommand('notepadd.exportToLatex', async () => {
		const notebook = window.activeNotebookEditor?.notebook;

		if (notebook?.notebookType !== 'notepadd') {
			return window.showErrorMessage(
				'Open a NotePADD notebook first to export it to LaTeX.',
			);
		}

		await notebook.save();

		const source = await workspace.fs.readFile(notebook.uri);

		const filedir = Uri.joinPath(notebook.uri, '..');
		const filename = notebook.uri.path.slice(filedir.path.length + 1);
		const basename = filename.replace(/\.np\.md$/, '');

		try {
			await workspace.fs.delete(Uri.joinPath(filedir, basename), {
				recursive: true,
			});
		} catch {}

		for (const [filename, content] of exportNotebookToLatex(
			deserializeNotePadd(source),
			basename,
		)) {
			await workspace.fs.writeFile(
				Uri.joinPath(filedir, filename),
				content,
			);
		}
	});
}
