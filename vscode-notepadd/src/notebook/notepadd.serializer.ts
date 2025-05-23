import {
	deserializeNotePadd,
	serializeNotePadd,
	type NotePadd,
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
	type Disposable,
	type NotebookDocument,
	type NotebookSerializer,
} from 'vscode';

export function convertNotePaddToVsCodeNotebook(
	notepadd: NotePadd,
): NotebookData {
	const notebook = new NotebookData(
		notepadd.cells.map((i) => {
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

	notebook.metadata = notepadd.metadata;

	return notebook;
}

export function convertVscodeNotebookToNotePadd(
	notebook: NotebookData | NotebookDocument,
): NotePadd {
	const cells = 'getCells' in notebook ? notebook.getCells() : notebook.cells;

	return {
		cells: cells.map<NotePaddCell>((i) => ({
			type: i.kind === NotebookCellKind.Code ? 'code' : 'markup',
			lang: 'document' in i ? i.document.languageId : i.languageId,
			source: 'document' in i ? i.document.getText() : i.value,
			metadata: i.metadata,
			executionSummary: i.executionSummary,
			outputs: i.outputs?.map<NotePaddOutput>((i) => ({
				items: Object.fromEntries(i.items.map((i) => [i.mime, i.data])),
				metadata: i.metadata,
			})),
		})),
		metadata: notebook.metadata,
	};
}

export class NotePaddSerializer implements NotebookSerializer, Disposable {
	private readonly _registry = workspace.registerNotebookSerializer(
		'notepadd',
		this,
	);

	dispose(): void {
		this._registry.dispose();
	}

	deserializeNotebook(content: Uint8Array): NotebookData {
		return convertNotePaddToVsCodeNotebook(deserializeNotePadd(content));
	}

	serializeNotebook(notebook: NotebookData): Uint8Array {
		return serializeNotePadd(convertVscodeNotebookToNotePadd(notebook));
	}
}
