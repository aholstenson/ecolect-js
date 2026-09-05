import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import importPlugin from 'eslint-plugin-import-x';
import jsdoc from 'eslint-plugin-jsdoc';
import globals from 'globals';
import tsdoc from 'eslint-plugin-tsdoc';
import tseslint from 'typescript-eslint';

export default tseslint.config(
	{
		ignores: [
			'**/dist/**',
			'**/node_modules/**',
			'**/apidocs/**',
			'src/tokenization/matchers.ts'
		]
	},

	js.configs.recommended,
	tseslint.configs.eslintRecommended,

	{
		files: [ '**/*.ts' ],

		languageOptions: {
			parser: tseslint.parser,
			parserOptions: {
				project: './tsconfig.eslint.json',
				tsconfigRootDir: import.meta.dirname
			}
		},

		plugins: {
			'@typescript-eslint': tseslint.plugin,
			'@stylistic': stylistic,
			'import-x': importPlugin,
			jsdoc: jsdoc,
			tsdoc: tsdoc
		},

		settings: {
			jsdoc: {
				mode: 'typescript'
			},
			'import-x/resolver-next': [
				createTypeScriptImportResolver({
					project: './tsconfig.eslint.json'
				})
			]
		},

		rules: {
			'no-irregular-whitespace': 'error',
			'no-unused-vars': 'off',
			eqeqeq: 'error',
			'no-throw-literal': 'error',
			'no-shadow': 'off',
			'no-console': 'warn',
			'no-debugger': 'error',
			'no-alert': 'error',
			'prefer-const': 'warn',
			'no-var': 'error',
			'no-param-reassign': 'warn',
			'no-multi-assign': 'warn',
			'no-unneeded-ternary': 'warn',
			'no-mixed-operators': 'warn',
			'nonblock-statement-body-position': 'warn',
			'dot-notation': 'warn',

			'@typescript-eslint/adjacent-overload-signatures': 'warn',
			'@typescript-eslint/await-thenable': 'warn',
			'@typescript-eslint/consistent-type-assertions': 'error',
			'@typescript-eslint/consistent-type-definitions': 'error',
			'@typescript-eslint/explicit-member-accessibility': [
				'error',
				{
					accessibility: 'explicit',
					overrides: {
						properties: 'off'
					}
				}
			],
			'@typescript-eslint/member-ordering': 'off',
			'@typescript-eslint/no-array-constructor': 'warn',
			'@typescript-eslint/no-empty-function': 'warn',
			'@typescript-eslint/no-empty-object-type': 'warn',
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-floating-promises': 'error',
			'@typescript-eslint/no-misused-new': 'error',
			'@typescript-eslint/no-namespace': 'error',
			'@typescript-eslint/no-non-null-assertion': 'error',
			'@typescript-eslint/no-shadow': 'warn',
			'@typescript-eslint/no-require-imports': 'error',
			'@typescript-eslint/no-unnecessary-type-assertion': 'warn',
			'@typescript-eslint/no-unused-vars': [ 'warn', {
				vars: 'all',
				args: 'after-used',
				ignoreRestSiblings: false
			} ],
			'@typescript-eslint/prefer-function-type': 'error',
			'@typescript-eslint/prefer-namespace-keyword': 'error',
			'@typescript-eslint/triple-slash-reference': 'error',
			'@typescript-eslint/unified-signatures': 'off',

			/*
			 * Formatting. These used to live in ESLint core and in
			 * `@typescript-eslint`, and are now provided by `@stylistic`.
			 */
			'@stylistic/array-bracket-spacing': [ 'warn', 'always' ],
			'@stylistic/arrow-parens': [ 'warn', 'as-needed' ],
			'@stylistic/arrow-spacing': [ 'warn', { before: true, after: true } ],
			'@stylistic/block-spacing': [ 'warn', 'always' ],
			'@stylistic/brace-style': [ 'warn', '1tbs' ],
			'@stylistic/comma-spacing': [ 'warn', { before: false, after: true } ],
			'@stylistic/comma-style': [ 'warn', 'last' ],
			'@stylistic/computed-property-spacing': [ 'warn', 'never' ],
			'@stylistic/function-call-spacing': 'warn',
			'@stylistic/generator-star-spacing': [ 'warn', { before: true, after: false } ],
			'@stylistic/indent': [ 'error', 'tab', {
				SwitchCase: 1,
				ignoredNodes: [ 'TSTypeLiteral', 'TSUnionType' ]
			} ],
			'@stylistic/key-spacing': [ 'warn', {
				beforeColon: false,
				afterColon: true,
				mode: 'strict'
			} ],
			'@stylistic/keyword-spacing': [ 'warn', {
				before: true,
				after: true,
				overrides: {
					if: { after: false },
					for: { after: false },
					while: { after: false },
					switch: { after: false },
					catch: { after: false }
				}
			} ],
			'@stylistic/member-delimiter-style': [ 'error', {
				multiline: { delimiter: 'semi', requireLast: true },
				singleline: { delimiter: 'semi', requireLast: false }
			} ],
			'@stylistic/no-extra-semi': 'error',
			'@stylistic/no-multi-spaces': 'warn',
			'@stylistic/no-multiple-empty-lines': 'warn',
			'@stylistic/object-curly-spacing': [ 'warn', 'always' ],
			'@stylistic/padded-blocks': [ 'warn', 'never' ],
			'@stylistic/quote-props': [ 'warn', 'as-needed' ],
			'@stylistic/quotes': [ 'error', 'single', { avoidEscape: true } ],
			'@stylistic/semi': [ 'error', 'always' ],
			'@stylistic/semi-spacing': [ 'warn', { before: false, after: true } ],
			'@stylistic/space-before-blocks': 'warn',
			'@stylistic/space-before-function-paren': [ 'warn', {
				anonymous: 'never',
				named: 'never',
				asyncArrow: 'always'
			} ],
			'@stylistic/space-in-parens': [ 'warn', 'never' ],
			'@stylistic/space-infix-ops': 'warn',
			'@stylistic/space-unary-ops': [ 'warn', {
				words: true,
				nonwords: false,
				overrides: {
					'!': true,
					'!!': true
				}
			} ],
			'@stylistic/spaced-comment': 'warn',

			'tsdoc/syntax': 'warn',
			'jsdoc/check-alignment': 'warn',
			'jsdoc/check-examples': 'off',
			'jsdoc/check-param-names': [ 'warn', { checkDestructured: false } ],
			'jsdoc/check-syntax': 'warn',
			'jsdoc/check-tag-names': [ 'error', {
				definedTags: [ 'remarks', 'typeParam' ]
			} ],
			'jsdoc/empty-tags': 'warn',
			'jsdoc/no-types': 'warn',
			'jsdoc/require-description': [ 'warn', { contexts: [ 'any' ] } ],
			'jsdoc/require-jsdoc': 'warn',
			'jsdoc/require-param': [ 'warn', { checkDestructured: false } ],
			'jsdoc/require-param-description': 'warn',
			'jsdoc/require-param-name': 'warn',
			'jsdoc/require-returns': 'warn',
			'jsdoc/require-returns-check': 'warn',
			'jsdoc/require-returns-description': 'warn',
			'jsdoc/tag-lines': [ 'warn', 'any', { startLines: 1 } ],

			/*
			 * `import-x/extensions` reports the extension of the resolved
			 * file, so it asks for `.ts` where the source correctly writes
			 * `.js`. TypeScript enforces the extension itself under
			 * `module: NodeNext`, so the rule adds nothing here.
			 */
			'import-x/extensions': 'off',
			'import-x/first': 'warn',
			'import-x/newline-after-import': 'warn',
			'import-x/no-default-export': 'warn',
			'import-x/no-duplicates': 'warn',
			'import-x/no-dynamic-require': 'warn',
			'import-x/no-extraneous-dependencies': 'error',
			'import-x/no-namespace': 'warn',
			'import-x/no-self-import': 'error',
			'import-x/no-useless-path-segments': [ 'warn', { noUselessIndex: false } ],
			'import-x/order': [ 'warn', {
				'newlines-between': 'always',
				groups: [ 'builtin', 'external', 'internal', 'parent', 'sibling', 'index' ],
				alphabetize: {
					order: 'asc',
					caseInsensitive: true
				}
			} ]
		}
	},

	{
		files: [ 'test/**/*.ts' ],
		rules: {
			/*
			 * Tests reach for development dependencies and describe themselves
			 * through their names rather than through doc comments.
			 */
			'import-x/no-extraneous-dependencies': [ 'error', { devDependencies: true } ],
			'jsdoc/require-jsdoc': 'off'
		}
	},

	{
		// Tool configuration is addressed by its default export.
		files: [ 'eslint.config.js', 'vitest.config.ts' ],
		rules: {
			'import-x/no-default-export': 'off'
		}
	},

	{
		files: [ '**/*.js' ],
		languageOptions: {
			globals: globals.node
		},
		rules: {
			'no-console': 'off',
			'import-x/no-default-export': 'off',
			'jsdoc/require-jsdoc': 'off'
		}
	}
);
