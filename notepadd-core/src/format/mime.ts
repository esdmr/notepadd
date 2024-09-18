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
