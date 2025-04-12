import MIMEType from 'whatwg-mimetype';
import {mapRecord} from '../utils.ts';

const builtinMimeTypeOfLangIds: Record<string, string> = {
	html: 'text/html',
	svg: 'image/svg+xml',
	markdown: 'text/markdown',
	plaintext: 'text/plain',
	json: 'application/json',
	error: 'application/vnd.code.notebook.error',
	stderr: 'application/vnd.code.notebook.stderr',
	stdout: 'application/vnd.code.notebook.stdout',
	notepadd: 'application/x-notepadd+json',
};

export function getMimeTypeOfLangId(langId: string) {
	return builtinMimeTypeOfLangIds[langId] ?? `text/x-${langId}`;
}

export function getMimeTypeOfMarkdownLang(
	// eslint-disable-next-line @typescript-eslint/ban-types
	mdLang: string | null | undefined,
) {
	const [langId = 'plaintext', mime] = mdLang?.split(' ', 2) ?? [];

	return mime ?? getMimeTypeOfLangId(langId);
}

const builtinLangIdOfMimeTypes = mapRecord(
	builtinMimeTypeOfLangIds,
	([k, v]) => [v, k],
);

const mimeSubTypeLangIdRegExp = /^(?:x[-.]|vnd[-.])?(?:[^+]+\+)*([^+]+)$/;

export function getLangIdOfMimeType(mime: string) {
	const mimeType = new MIMEType(mime);

	return (
		builtinLangIdOfMimeTypes[mimeType.essence] ??
		mimeSubTypeLangIdRegExp.exec(mimeType.subtype)?.[1] ??
		mimeType.subtype
	);
}

export function getMarkdownLangOfMimeType(mime: string) {
	const langId = getLangIdOfMimeType(mime);

	return getMimeTypeOfLangId(langId) === mime ? langId : `${langId} ${mime}`;
}

const builtinMimeTypeOfFileExtensions: Record<string, string> = {
	// Vector
	ai: 'application/postscript',
	ps: 'application/postscript',
	eps: 'application/postscript',
	pdf: 'application/pdf',
	svg: 'image/svg+xml',

	// Raster
	avif: 'image/avif',
	bmp: 'image/bmp',
	dib: 'image/bmp',
	dpx: 'image/dpx',
	exr: 'image/aces',
	fits: 'image/fits',
	gif: 'image/gif',
	heic: 'image/heic',
	jp2: 'image/jp2',
	jpe: 'image/jpeg',
	jpeg: 'image/jpeg',
	jpg: 'image/jpeg',
	jxl: 'image/jxl',
	jxr: 'image/jxr',
	png: 'image/png',
	sgi: 'image/sgi',
	tif: 'image/tiff',
	tiff: 'image/tiff',
	webp: 'image/webp',
};

export function getMimeTypeOfFileExtension(extension: string) {
	return builtinMimeTypeOfFileExtensions[extension.toLowerCase()];
}

const builtinPreferredFileExtensionOfMimeTypes: Record<string, string> = {
	...mapRecord(builtinMimeTypeOfFileExtensions, ([k, v]) => [v, k]),
	/* eslint-disable @typescript-eslint/naming-convention */
	'application/postscript': 'ps',
	'image/bmp': 'bmp',
	'image/jpeg': 'jpeg',
	'image/tiff': 'tiff',
	/* eslint-enable @typescript-eslint/naming-convention */
};

export function getPreferredFileExtensionOfMimeType(mime: string) {
	const mimeType = new MIMEType(mime);
	return builtinPreferredFileExtensionOfMimeTypes[mimeType.essence];
}

const builtinVectorMimeTypes = new Set([
	'application/postscript',
	'application/pdf',
	'image/svg+xml',
]);

export function isMimeTypeVectorImage(mime: string) {
	const mimeType = new MIMEType(mime);
	return builtinVectorMimeTypes.has(mimeType.essence);
}
