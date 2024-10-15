import {inspect} from 'node:util';
import {
	NotebookCellOutput,
	NotebookCellOutputItem,
	notebooks,
	workspace,
	type ExtensionContext,
	type NotebookCell,
	type NotebookController,
	type NotebookDocument,
	type Disposable,
	type NotebookCellExecution,
} from 'vscode';
import {
	directiveMimeType,
	parseDirective,
	splitUint8Array,
} from 'notepadd-core';
import {execa, type Options} from 'execa';
import {
	compareUint8Arrays,
	stringToUint8Array,
	uint8ArrayToString,
} from 'uint8array-extras';
import {version} from '../../package.json';
import {output} from '../output.ts';
import {TokenWrapper} from '../utils.ts';

const magicBytesForPng = new Uint8Array([0x89, 0x50, 0x4e, 0x47]);

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
		this._controller.supportedLanguages = ['notepadd', 'plantuml'];
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

		execution.end(true, Date.now());
	}

	async executePlantUml(
		cell: NotebookCell,
		execution: NotebookCellExecution,
	) {
		const config = workspace.getConfiguration(
			'notepadd.plantuml',
			cell.document,
		);

		const java = config.get<string>('java') ?? 'java';
		const jar = config.get<string>('jar');
		const server = config.get<string>('server');
		const renderer = config.get<'Local' | 'Server'>('renderer') ?? 'Local';
		const javaArguments = config.get<string[]>('javaArguments') ?? [];
		const jarArguments = config.get<string[]>('jarArguments') ?? [];

		if (renderer !== 'Local') {
			// TODO: Implement PlantUML server renderer
			throw new Error('Server renderer is not implemented yet');
		}

		if (!jar) {
			throw new Error(
				'“plantuml.jar” is not available. Download one from <https://plantuml.com/download> and configure “notepadd.plantuml.jar” to point to it.',
			);
		}

		let text = cell.document.getText();

		if (!text.includes('@startuml')) {
			text = `@startuml\n${text}\n@enduml`;
		}

		const delimiter = `___NOTEPADD_PLANTUML_IMAGE_DELIMITER_${Math.random()}___`;
		const token = new TokenWrapper(execution.token);

		// TODO: Support multi-page PlantUML diagrams (via `newpage`)
		const result = await execa(
			java,
			[
				...javaArguments,
				'-jar',
				jar,
				...jarArguments,
				'-pipe',
				'-pipedelimitor',
				delimiter,
				'-pipeNoStderr',
			],
			{
				encoding: 'buffer',
				reject: false,
				cancelSignal: token.signal,
				input: `@@@format png\n${text}\n@@@format svg\n${text}\n`,
			} satisfies Options,
		);

		token.dispose();

		if (result.isCanceled) {
			execution.end(undefined);
			return;
		}

		if (result.exitCode !== 0) {
			output.error(
				'[NotePADD/Arch/PlantUML]',
				'Rendering failed.',
				result,
			);

			await execution.replaceOutput(
				new NotebookCellOutput([
					result instanceof Error
						? NotebookCellOutputItem.error(result)
						: NotebookCellOutputItem.stderr(inspect(result)),
				]),
			);

			execution.end(false, Date.now());
		}

		if (result.stderr.length > 0) {
			output.error(
				'[NotePADD/Arch/PlantUML/err]',
				uint8ArrayToString(result.stderr),
			);
		}

		const delimiterUint8Array = stringToUint8Array(delimiter);
		const parts = splitUint8Array(result.stdout, delimiterUint8Array);

		const png: Uint8Array[] = [];
		const svg: Uint8Array[] = [];

		for (const item of parts) {
			if (
				compareUint8Arrays(item.subarray(0, 4), magicBytesForPng) === 0
			) {
				png.push(item);
			} else {
				svg.push(item);
			}
		}

		if (png.length === svg.length) {
			await execution.replaceOutput(
				png.map(
					(i, index) =>
						new NotebookCellOutput([
							new NotebookCellOutputItem(i, 'image/png'),
							new NotebookCellOutputItem(
								svg[index]!,
								'image/svg+xml',
							),
						]),
				),
			);
		} else {
			output.warn(
				'[NotePADD/Arch/PlantUML]',
				`PNG and SVG outputs do not match in length (${png.length} ≠ ${svg.length}).`,
			);

			const image = png.length > svg.length ? png : svg;
			const mime =
				png.length > svg.length ? 'image/png' : 'image/svg+xml';

			await execution.replaceOutput(
				image.map(
					(i) =>
						new NotebookCellOutput([
							new NotebookCellOutputItem(i, mime),
						]),
				),
			);
		}

		execution.end(true, Date.now());
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
					await this.executeDirective(cell, execution);
				} else if (cell.document.languageId === 'plantuml') {
					await this.executePlantUml(cell, execution);
				} else {
					await execution.clearOutput();
					execution.end(undefined, Date.now());
				}
			} catch (error) {
				output.error('[NotePADD/Arch]', error);

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
