import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

/*
 * Run the test suite in a headless browser. The library targets browsers as
 * well as Node, and this run finds code that needs Node, and engine
 * differences such as in `Intl` and Unicode data.
 *
 * Install the browsers once with
 * `pnpm exec playwright install chromium firefox webkit`.
 */
export default defineConfig({
	test: {
		globals: true,
		include: [ 'test/**/*.test.ts' ],
		browser: {
			enabled: true,
			headless: true,
			provider: playwright(),
			instances: [
				{ browser: 'chromium' },
				{ browser: 'firefox' },
				{ browser: 'webkit' }
			]
		}
	}
});
