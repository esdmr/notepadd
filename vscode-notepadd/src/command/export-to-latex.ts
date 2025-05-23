import {mkdtemp, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {setTimeout} from 'node:timers/promises';
import {execa, type Options} from 'execa';
import {
	deserializeNotePadd,
	exportNotebookToLatex,
	getMimeTypeOfFileExtension,
	getPreferredFileExtensionOfMimeType,
	isMimeTypeVectorImage,
} from 'notepadd-core';
import {uint8ArrayToString} from 'uint8array-extras';
import {
	commands,
	ProgressLocation,
	Uri,
	window,
	workspace,
	type Disposable,
} from 'vscode';
import {output} from '../output.ts';
import {convertUriToUrl} from '../utils.ts';
import {convertVscodeNotebookToNotePadd} from '../notebook/notepadd.serializer.ts';

const fetchMaxRetry = 5;

type Image = {
	readonly extension: string;
	readonly mime: string;
	readonly content: Uint8Array;
};

const supportedMimeTypesByLatex = new Set([
	'application/pdf',
	'image/png',
	'image/jpeg',
]);

async function fetchImageFromNetworkWithoutRetries(
	uri: Uri,
	signal?: AbortSignal,
): Promise<Image> {
	const response = await fetch(convertUriToUrl(uri), {
		headers: {
			/* eslint-disable @typescript-eslint/naming-convention */
			Accept: 'application/pdf, application/postscript;q=0.9, image/svg+xml;q=0.9, image/png;q=0.8, image/jpeg;q=0.7, image/*;q=0.6',
			/* eslint-enable @typescript-eslint/naming-convention */
		},
		signal,
	});

	if (!response.ok) {
		throw new Error(
			`Received status type of ${response.status} ${response.statusText}`,
		);
	}

	const mime = response.headers.get('Content-Type');

	if (!mime) {
		// TODO: Maybe use MIME sniffing here?
		throw new Error('Response did not have a Content-Type');
	}

	let extension = path.extname(uri.fsPath).slice(1);

	if (!extension || getMimeTypeOfFileExtension(extension) !== mime) {
		extension = getPreferredFileExtensionOfMimeType(mime) ?? '';
	}

	if (!extension) {
		throw new Error(`Response Content-Type is unknown: ${mime}`);
	}

	return {
		mime,
		extension,
		content: await response.bytes(),
	};
}

async function fetchImageFromNetwork(uri: Uri): Promise<Image> {
	for (let i = 0; ; i++) {
		const abort = new AbortController();

		try {
			return await fetchImageFromNetworkWithoutRetries(uri, abort.signal);
		} catch (error) {
			abort.abort(error);

			if (i >= fetchMaxRetry) {
				throw error;
			}

			await setTimeout(2 ** i);
		}
	}
}

async function fetchImageFromFileSystem(uri: Uri): Promise<Image> {
	const name = path.basename(uri.fsPath);
	const extension = path.extname(uri.fsPath).slice(1);

	if (!extension) {
		// TODO: Maybe use MIME sniffing here?
		throw new Error(`File name did not have an extension: ${name}`);
	}

	const mime = getMimeTypeOfFileExtension(extension);

	if (!mime) {
		throw new Error(`Unknown file extension: ${extension}`);
	}

	return {
		mime,
		extension,
		content: await workspace.fs.readFile(uri),
	};
}

async function fetchImage(uri: Uri): Promise<Image> {
	output.debug('[NotePADD/Export]', 'Fetching image at', uri.fsPath);

	switch (uri.scheme) {
		case 'http':
		case 'https':
		case 'data': {
			return fetchImageFromNetwork(uri);
		}

		default: {
			return fetchImageFromFileSystem(uri);
		}
	}
}

async function convertVectorImage(image: Image): Promise<Image> {
	const cwd = await mkdtemp(path.resolve(tmpdir(), 'notepadd-'));

	try {
		const filePath = path.resolve(cwd, `input.${image.extension}`);
		await writeFile(filePath, image.content);

		// Inkscape has a `--pipe` option but that only allows for SVG files.
		// No option to change the input file type exists yet.
		// See <https://gitlab.com/inkscape/inbox/-/issues/2871>.
		const result = await execa(
			'inkscape',
			[filePath, '-o', '-', '--export-type', 'pdf'],
			{
				encoding: 'buffer',
				stdin: 'ignore',
				reject: false,
			} satisfies Options,
		);

		if (result.stderr.length > 0) {
			output.error(
				'[NotePADD/Export/Inkscape/err]',
				uint8ArrayToString(result.stderr),
			);
		}

		if (result.exitCode !== 0) {
			output.error(
				'[NotePADD/Export/Inkscape]',
				'Conversion to PDF failed.',
			);

			throw new Error('Conversion to PDF failed', {cause: result});
		}

		return {
			content: result.stdout,
			mime: 'application/pdf',
			extension: 'pdf',
		};
	} finally {
		await rm(cwd, {recursive: true, force: true});
	}
}

async function convertRasterImage(image: Image): Promise<Image> {
	// FIXME: Support ImageMagick v7 `magick`.
	const result = await execa('convert', [`${image.extension}:-`, 'png:-'], {
		encoding: 'buffer',
		input: image.content,
		reject: false,
	} satisfies Options);

	if (result.stderr.length > 0) {
		output.error(
			'[NotePADD/Export/ImageMagick/err]',
			uint8ArrayToString(result.stderr),
		);
	}

	if (result.exitCode !== 0) {
		output.error(
			'[NotePADD/Export/ImageMagick]',
			'Conversion to PNG failed.',
			result,
		);

		throw new Error('Conversion to PNG failed', {cause: result});
	}

	return {
		content: result.stdout,
		mime: 'image/png',
		extension: 'png',
	};
}

async function convertImage(image: Image): Promise<Image> {
	if (supportedMimeTypesByLatex.has(image.mime)) {
		return image;
	}

	if (isMimeTypeVectorImage(image.mime)) {
		return convertVectorImage(image);
	}

	return convertRasterImage(image);
}

export function setupExportToLatexCommand(): Disposable {
	return commands.registerCommand('notepadd.exportToLatex', async () => {
		const notebook = window.activeNotebookEditor?.notebook;

		if (notebook?.notebookType !== 'notepadd') {
			return window.showErrorMessage(
				'Open a NotePADD notebook first to export it to LaTeX.',
			);
		}

		if (workspace.fs.isWritableFileSystem(notebook.uri.scheme) === false) {
			return window.showErrorMessage(
				'Cannot write to a read-only file system.',
			);
		}

		const dirname = Uri.joinPath(notebook.uri, '..');
		const jobName = path.basename(notebook.uri.fsPath, '.np.md');

		// `FileSystem.delete` throws if target does not exist. It does not have
		// a `force` option, unlike Node.js’s `rm`. Avoid doing a `stat` first,
		// since that causes a race condition.
		try {
			await workspace.fs.delete(Uri.joinPath(dirname, jobName), {
				recursive: true,
			});
		} catch {}

		const files = exportNotebookToLatex(
			convertVscodeNotebookToNotePadd(notebook),
			jobName,
		);

		await window.withProgress(
			{
				location: ProgressLocation.Window,
				title: 'Exporting to LaTeX',
			},
			async (progress) => {
				for (const [name, file] of files) {
					switch (file.type) {
						case 'raw': {
							progress.report({message: `Saving ${name}`});
							await workspace.fs.writeFile(
								Uri.joinPath(dirname, name),
								file.content,
							);
							break;
						}

						case 'image': {
							progress.report({
								message: `Downloading ${name}: ${file.url.slice(0, 32)}`,
							});

							let uri: Uri;

							try {
								uri = Uri.parse(file.url, true);
							} catch {
								uri = Uri.joinPath(dirname, file.url);
							}

							const image = await fetchImage(uri);

							progress.report({
								message: `Saving ${name}`,
							});

							await workspace.fs.writeFile(
								Uri.joinPath(
									dirname,
									name + '.' + image.extension,
								),
								image.content,
							);

							progress.report({
								message: `Converting ${name}`,
							});

							const convertedImage = await convertImage(image);

							await workspace.fs.writeFile(
								Uri.joinPath(
									dirname,
									name + '.' + convertedImage.extension,
								),
								convertedImage.content,
							);

							break;
						}

						case 'rawImage': {
							const extension =
								getPreferredFileExtensionOfMimeType(file.mime);

							if (!extension) {
								throw new Error(
									`Unknown MIME type: ${file.mime}`,
								);
							}

							const image: Image = {
								content: file.content,
								mime: file.mime,
								extension,
							};

							progress.report({
								message: `Saving ${name}`,
							});

							await workspace.fs.writeFile(
								Uri.joinPath(
									dirname,
									name + '.' + image.extension,
								),
								image.content,
							);

							progress.report({
								message: `Converting ${name}`,
							});

							const convertedImage = await convertImage(image);

							await workspace.fs.writeFile(
								Uri.joinPath(
									dirname,
									name + '.' + convertedImage.extension,
								),
								convertedImage.content,
							);

							break;
						}
					}
				}
			},
		);
	});
}
