import { en } from '@ecolect/language-en';

import { newPhrases } from '../../src/resolver/newPhrases';
import { anyTextValue } from '../../src/values';

describe('Value: anyTextValue', function() {
	describe('Phrases', function() {
		const resolver = newPhrases()
			.value('value', anyTextValue())
			.phrase('prefix {value}')
			.toMatcher(en);

		it('Prefixed: string value', async function() {
			const m = await resolver.match('prefix string value');
			expect(m).toBeTruthy();
			expect(m.values.value).toBe('string value');
		});

		it('Prefixed: URL', async function() {
			const m = await resolver.match('prefix https://example.com');
			expect(m).toBeTruthy();
			expect(m.values.value).toBe('https://example.com');
		});

		it.skip('Prefixed: URL 2', async function() {
			const m = await resolver.match('prefix https://www.example.com/path?queryParam=value');
			expect(m).toBeTruthy();
			expect(m.values.value).toBe('https://www.example.com/path?queryParam=value');
		});
	});
});
