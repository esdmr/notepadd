import {rehype} from 'rehype';
import rehypeSanitize from 'rehype-sanitize';
import {remark} from 'remark';
import remarkDirective from 'remark-directive';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import {mapObject} from './utils.ts';

export const markdown = remark()
	.use(remarkGfm)
	.use(remarkFrontmatter)
	.use(remarkDirective)
	.use(remarkMath, {singleDollarTextMath: false})
	.freeze();

export const html = rehype()
	.use(rehypeSanitize, {strip: ['script', 'style']})
	.freeze();

export const cellDirective = 'cell';
export const executionDirective = 'execution';
export const outputDirective = 'output';

export const builtinMimeTypeOfLangIds: Record<string, string> = {
	javascript: 'application/javascript',
	html: 'text/html',
	svg: 'image/svg+xml',
	markdown: 'text/markdown',
	plaintext: 'text/plain',
};

export const builtinLangIdOfMimeTypes = mapObject(
	builtinMimeTypeOfLangIds,
	([k, v]) => [v, k],
);
