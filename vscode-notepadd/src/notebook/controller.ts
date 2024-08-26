import {getMimeTypeOfLangId} from 'notepadd-core';
import {
	NotebookCellOutput,
	NotebookCellOutputItem,
	notebooks,
	type ExtensionContext,
	type NotebookCell,
	type NotebookController,
	type NotebookDocument,
} from 'vscode';
import {version} from '../../package.json';

class NotePaddController implements Partial<NotebookController> {
	static readonly id = 'notepadd-arch';
	static readonly notebookType = 'notepadd';
	static readonly label = 'NotePADD Arch';

	static create(): NotebookController {
		const controller = notebooks.createNotebookController(
			this.id,
			this.notebookType,
			this.label,
		);

		Object.assign(controller, new this());
		return controller;
	}

	readonly description = version;
	readonly detail = 'Default NotePADD kernel';
	readonly supportsExecutionOrder = true;
	private _lastIndex = 0;

	private constructor() {
		// Do nothing.
	}

	readonly executeHandler = async function (
		this: NotePaddController,
		cells: NotebookCell[],
		notebook: NotebookDocument,
		controller: NotebookController,
	) {
		for (const cell of cells) {
			const execution = controller.createNotebookCellExecution(cell);

			execution.executionOrder = this._lastIndex++;
			execution.start(Date.now());

			// TODO: Execution logic goes here.

			execution.end(undefined, Date.now());
		}
	};
}

export function setupController(context: ExtensionContext) {
	context.subscriptions.push(NotePaddController.create());
}
