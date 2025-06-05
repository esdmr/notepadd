/* eslint-disable @typescript-eslint/naming-convention */
import type {FlatXoConfig} from 'xo';

const xoConfig: FlatXoConfig = [
	{
		prettier: true,
	},
	{
		ignores: ['node_modules/', 'build/', '.subvite/', '*.generated.ts'],
	},
	{
		rules: {
			'n/file-extension-in-import': 'off',
			'import/extensions': 'off',
			'import/no-extraneous-dependencies': 'off',
			'@typescript-eslint/class-literal-property-style': [
				'error',
				'fields',
			],
			'@typescript-eslint/explicit-function-return-type': [
				'error',
				{
					allowExpressions: true,
					allowHigherOrderFunctions: true,
					allowIIFEs: true,
					allowTypedFunctionExpressions: true,
				},
			],
			'unicorn/prefer-top-level-await': 'off',
			'no-await-in-loop': 'off',
			'import/no-cycle': 'off',
		},
	},
];

export default xoConfig;
