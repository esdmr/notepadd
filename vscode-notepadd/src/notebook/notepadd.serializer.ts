import {
	deserializeNotePadd,
	serializeNotePadd,
	type NotePaddCell,
	type NotePaddOutput,
} from 'notepadd-core';
import {
	NotebookCellData,
	NotebookCellKind,
	NotebookCellOutput,
	NotebookCellOutputItem,
	NotebookData,
	workspace,
	type ExtensionContext,
	type NotebookSerializer,
	type Disposable,
} from 'vscode';

export class NotePaddSerializer implements NotebookSerializer, Disposable {
	private readonly _registry = workspace.registerNotebookSerializer(
		'notepadd',
		this,
	);

	dispose(): void {
		this._registry.dispose();
	}

	deserializeNotebook(content: Uint8Array): NotebookData {
		const data = deserializeNotePadd(content);

		const notebook = new NotebookData(
			data.cells.map((i) => {
				const cell = new NotebookCellData(
					i.type === 'code'
						? NotebookCellKind.Code
						: NotebookCellKind.Markup,
					i.source,
					i.lang,
				);

				cell.metadata = i.metadata;
				cell.executionSummary = i.executionSummary;

				cell.outputs = i.outputs?.map(
					(i) =>
						new NotebookCellOutput(
							Object.entries(i.items).map(
								([k, v]) => new NotebookCellOutputItem(v, k),
							),
							i.metadata,
						),
				);

				return cell;
			}),
		);

		notebook.metadata = data.metadata;

		return notebook;
	}

	serializeNotebook(notebook: NotebookData): Uint8Array {
		return serializeNotePadd({
			cells: notebook.cells.map<NotePaddCell>((i) => ({
				type: i.kind === NotebookCellKind.Code ? 'code' : 'markup',
				lang: i.languageId,
				source: i.value,
				metadata: i.metadata,
				executionSummary: i.executionSummary,
				outputs: i.outputs?.map<NotePaddOutput>((i) => ({
					items: Object.fromEntries(
						i.items.map((i) => [i.mime, i.data]),
					),
					metadata: i.metadata,
				})),
			})),
			metadata: notebook.metadata,
		});
	}
}
