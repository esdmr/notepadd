import {inspect} from 'node:util';
import {
	NotebookCellOutput,
	NotebookCellOutputItem,
	notebooks,
	type ExtensionContext,
	type NotebookCell,
	type NotebookController,
	type NotebookDocument,
	type Disposable,
	type NotebookCellExecution,
} from 'vscode';
import {directiveMimeType, parseDirective} from 'notepadd-core';
import {version} from '../../package.json';
import {output} from '../output.ts';

export class NotePaddController implements Disposable {
	private readonly _controller = notebooks.createNotebookController(
		'notepadd-arch',
		'notepadd',
		'NotePADD Arch',
		this.executeHandler.bind(this),
	);

	constructor() {
		this._controller.description = version;
		this._controller.detail = 'Default NotePADD kernel';
		this._controller.supportsExecutionOrder = false;
		this._controller.supportedLanguages = ['notepadd'];
	}

	dispose() {
		this._controller.dispose();
	}

	async executeDirective(
		cell: NotebookCell,
		execution: NotebookCellExecution,
	) {
		// TODO: Optionally enable AST debug via config.
		const {directive, ast} = parseDirective(
			cell.document.getText(),
			undefined,
		);

		await execution.replaceOutput(
			new NotebookCellOutput([
				NotebookCellOutputItem.json(directive, directiveMimeType),
				// TODO: Remove after implementing the renderer and service.
				NotebookCellOutputItem.json({
					directive,
					ast,
				}),
			]),
		);
	}

	async executeHandler(
		cells: NotebookCell[],
		notebook: NotebookDocument,
		controller: NotebookController,
	) {
		for (const cell of cells) {
			const execution = controller.createNotebookCellExecution(cell);

			execution.start(Date.now());

			try {
				if (cell.document.languageId === 'notepadd') {
					// eslint-disable-next-line no-await-in-loop
					await this.executeDirective(cell, execution);
					execution.end(true, Date.now());
				} else {
					// eslint-disable-next-line no-await-in-loop
					await execution.clearOutput();
					execution.end(undefined, Date.now());
				}
			} catch (error) {
				output.error('[NotePADD/Arch/Controller]', error);

				// eslint-disable-next-line no-await-in-loop
				await execution.replaceOutput(
					new NotebookCellOutput([
						error instanceof Error
							? NotebookCellOutputItem.error(error)
							: NotebookCellOutputItem.stderr(inspect(error)),
					]),
				);

				execution.end(false, Date.now());
			}
		}

		await notebook.save();
	}
}

export async function setupController(context: ExtensionContext) {
	context.subscriptions.push(new NotePaddController());
}
