import {rehype} from 'rehype';
import rehypeSanitize from 'rehype-sanitize';
import {remark} from 'remark';
import remarkDirective from 'remark-directive';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

export const markdown = remark()
	.use(remarkGfm)
	.use(remarkFrontmatter)
	.use(remarkDirective)
	.use(remarkMath, {singleDollarTextMath: false})
	.freeze();

export const html = rehype()
	.use(rehypeSanitize, {strip: ['script', 'style']})
	.freeze();
