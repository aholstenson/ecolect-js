import { en } from '@ecolect/language-en';

import { newPhrases } from '../../src/resolver/newPhrases.js';
import { anyTextValue } from '../../src/values/index.js';

import { assertNotNull } from '../assertions.js';

describe('Value: anyTextValue', function() {
	describe('Phrases', function() {
		const resolver = newPhrases()
			.value('value', anyTextValue())
			.phrase('prefix {value}')
			.toMatcher(en);

		it('Prefixed: string value', async function() {
			const m = await resolver.match('prefix string value');
			assertNotNull(m);
			expect(m.values.value).toBe('string value');
		});

		it('Prefixed: URL', async function() {
			const m = await resolver.match('prefix https://example.com');
			assertNotNull(m);
			expect(m.values.value).toBe('https://example.com');
		});

		it.skip('Prefixed: URL 2', async function() {
			const m = await resolver.match('prefix https://www.example.com/path?queryParam=value');
			assertNotNull(m);
			expect(m.values.value).toBe('https://www.example.com/path?queryParam=value');
		});
	});
});
