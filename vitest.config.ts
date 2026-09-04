import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

const source = (path: string) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
	/*
	 * Point the workspace packages at their sources so that tests run without
	 * a build step.
	 */
	resolve: {
		alias: [
			{ find: /^ecolect$/, replacement: source('./packages/ecolect/src/index.ts') },
			{ find: /^@ecolect\/graph$/, replacement: source('./packages/graph/src/index.ts') },
			{ find: /^@ecolect\/language$/, replacement: source('./packages/language/src/index.ts') },
			{ find: /^@ecolect\/language-en$/, replacement: source('./languages/en/src/index.ts') },
			{ find: /^@ecolect\/tokenization$/, replacement: source('./packages/tokenization/src/index.ts') },
			{ find: /^@ecolect\/type-datetime$/, replacement: source('./packages/type-datetime/src/index.ts') },
			{ find: /^@ecolect\/type-numbers$/, replacement: source('./packages/type-numbers/src/index.ts') }
		]
	},
	test: {
		globals: true,
		environment: 'node',
		include: [
			'packages/*/test/**/*.test.ts',
			'languages/*/test/**/*.test.ts'
		],
		coverage: {
			provider: 'v8',
			include: [
				'packages/*/src/**',
				'languages/*/src/**'
			]
		}
	}
});
