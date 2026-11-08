import { en } from '../../src/language/en/index.js';
import { newPhrases } from '../../src/resolver/newPhrases.js';
import { anyTextValue, dateValue } from '../../src/values/index.js';
import { assertNotNull } from '../assertions.js';
import { expectGrowth } from '../growth.js';

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

		it('Prefixed: text with double quotes', async function() {
			const m = await resolver.match('prefix he said "stop" now');
			assertNotNull(m);
			expect(m.values.value).toBe('he said "stop" now');
		});

		it('Prefixed: long word is matched fast', async function() {
			const word = 'a'.repeat(50000) + 'b';
			const m = await resolver.match('prefix ' + word);
			assertNotNull(m);
			expect(m.values.value).toBe(word);

			await expectGrowth(
				size => resolver.match('prefix ' + 'a'.repeat(size) + 'b'),
				{ from: 12500, to: 50000, degree: 1 }
			);
		});

		it.skip('Prefixed: URL 2', async function() {
			const m = await resolver.match('prefix https://www.example.com/path?queryParam=value');
			assertNotNull(m);
			expect(m.values.value).toBe('https://www.example.com/path?queryParam=value');
		});
	});

	describe('Decomposed accents', function() {
		it('Source offsets point at the value in the input', async function() {
			const resolver = newPhrases()
				.value('who', anyTextValue())
				.phrase('orders for {who}')
				.toMatcher(en);

			// e followed by a combining acute accent
			const input = 'orders for Rene\u0301 Smith';
			const m = await resolver.match(input);
			assertNotNull(m);

			const e = m.expression;
			expect(e[e.length - 1].source).toEqual({ start: 11, end: 22 });
			expect(input.slice(11, 22)).toEqual('Rene\u0301 Smith');
		});

		it('Source offsets after the value point at the next part', async function() {
			const resolver = newPhrases()
				.value('q', anyTextValue())
				.value('when', dateValue())
				.phrase('find {q} {when}')
				.toMatcher(en);

			const input = 'find cafe\u0301 tomorrow';
			const m = await resolver.match(input, { now: new Date(2026, 10, 8) });
			assertNotNull(m);

			const e = m.expression;
			expect(e[e.length - 1].source).toEqual({ start: 11, end: 19 });
			expect(input.slice(11, 19)).toEqual('tomorrow');
		});

		it('Letters that are joined into one keep the value and its offsets', async function() {
			const resolver = newPhrases()
				.value('who', anyTextValue())
				.phrase('orders for {who}')
				.toMatcher(en);

			// Hangul syllable written as three separate letters
			const input = 'orders for \u1112\u1161\u11AB Smith';
			const m = await resolver.match(input);
			assertNotNull(m);

			expect(m.values.who).toEqual('\uD55C Smith');

			const e = m.expression;
			expect(e[e.length - 1].source).toEqual({ start: 11, end: 20 });
		});
	});
});
