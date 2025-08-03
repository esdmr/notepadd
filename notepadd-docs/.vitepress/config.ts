import {defineConfig} from 'vitepress';

export default defineConfig({
	title: 'NotePADD',
	description: 'Note-taking and dashboard tool',
	lastUpdated: true,
	markdown: {
		math: true,
	},
	themeConfig: {
		editLink: {
			pattern:
				'https://github.com/esdmr/notepadd/edit/main/notepadd-docs/:path',
		},
		footer: {
			message: 'Released under the MIT License.',
			copyright: 'Copyright © 2025-present esdmr',
		},
		nav: [{text: 'Getting Started', link: '/getting-started'}],
		sidebar: [
			{
				text: 'Introduction',
				items: [
					{text: 'Getting Started', link: '/getting-started'},
					{text: 'Taking Notes', link: '/taking-notes'},
				],
			},
		],
		socialLinks: [
			{icon: 'github', link: 'https://github.com/esdmr/notepadd'},
		],
	},
});
