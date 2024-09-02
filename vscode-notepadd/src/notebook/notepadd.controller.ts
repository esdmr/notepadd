import {inspect} from 'node:util';
import {
	languages,
	NotebookCellOutput,
	NotebookCellOutputItem,
	notebooks,
	type ExtensionContext,
	type NotebookCell,
	type NotebookController,
	type NotebookDocument,
} from 'vscode';
import {parseDirective} from 'notepadd-core';
import {version} from '../../package.json';

class NotePaddController implements Partial<NotebookController> {
	static readonly id = 'notepadd-arch';
	static readonly notebookType = 'notepadd';
	static readonly label = 'NotePADD Arch';

	static async create() {
		const controller = notebooks.createNotebookController(
			this.id,
			this.notebookType,
			this.label,
		);

		const langs = await languages.getLanguages();

		Object.assign(controller, new this(langs));

		return controller;
	}

	readonly description = version;
	readonly detail = 'Default NotePADD kernel';
	readonly supportsExecutionOrder = true;
	readonly supportedLanguages;
	private _lastIndex = 0;

	private constructor(langs: readonly string[] = []) {
		this.supportedLanguages = [
			'notepadd',
			...langs.filter((i) => i === 'notepadd'),
		];
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

			try {
				if (cell.document.languageId === 'notepadd') {
					// eslint-disable-next-line no-await-in-loop
					await execution.replaceOutput(
						new NotebookCellOutput([
							NotebookCellOutputItem.json(
								parseDirective(cell.document.getText()),
								'application/x-notepadd+json',
							),
						]),
					);

					execution.end(true, Date.now());
				} else {
					// eslint-disable-next-line no-await-in-loop
					await execution.clearOutput();
					execution.end(undefined, Date.now());
				}
			} catch (error) {
				// eslint-disable-next-line no-await-in-loop
				await execution.replaceOutput(
					new NotebookCellOutput([
						error instanceof Error
							? NotebookCellOutputItem.error(error)
							: NotebookCellOutputItem.stderr(inspect(error)),
					]),
				);

				execution.end(false, Date.now());
				throw error;
			}
		}
	};
}

export async function setupController(context: ExtensionContext) {
	context.subscriptions.push(await NotePaddController.create());
}
