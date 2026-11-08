import { en } from '../../../src/language/en/index.js';
import { tokenComparer } from '../../../src/language/en/tokenComparer.js';
import { tokenizer } from '../../../src/language/en/tokenizer.js';
import { newPhrases } from '../../../src/resolver/newPhrases.js';

/**
 * Tokenize a single word with the English tokenizer.
 *
 * @param word -
 *   the word to tokenize
 * @returns
 *   the token of the word
 */
function token(word: string) {
	return tokenizer(word)[0];
}

describe('English', function() {
	describe('Token comparer', function() {
		describe('Words that share a stem but not a meaning', function() {
			it('new does not match news with a high score', async function() {
				const resolver = newPhrases()
					.phrase('show news')
					.toMatcher(en);

				const m = await resolver.match('show new');
				expect(m?.score ?? 0).toBeLessThan(0.9);
			});

			it('universe does not match university with a high score', async function() {
				const resolver = newPhrases()
					.phrase('university courses')
					.toMatcher(en);

				const m = await resolver.match('universe courses');
				expect(m?.score ?? 0).toBeLessThan(0.9);
			});

			it.each([
				[ 'busy', 'business' ],
				[ 'general', 'generous' ],
				[ 'organ', 'organization' ],
				[ 'experiment', 'experience' ],
				[ 'computer', 'compute' ]
			])('%s is not %s', function(a, b) {
				expect(tokenComparer.compare(token(a), token(b))).toEqual(0);
			});
		});

		describe('Forms of the same word', function() {
			it.each([
				[ 'order', 'orders' ],
				[ 'city', 'cities' ],
				[ 'run', 'running' ],
				[ 'stop', 'stopped' ],
				[ 'make', 'making' ],
				[ 'activate', 'activated' ]
			])('%s matches %s', function(a, b) {
				expect(tokenComparer.compare(token(a), token(b))).toEqual(0.95);
			});
		});

		describe('Letters outside the Basic Multilingual Plane', function() {
			it('Different words are not similar', function() {
				expect(tokenComparer.compare(token('hello'), token('helps'))).toEqual(0);
				// Mathematical bold letters
				expect(tokenComparer.compare(token('𝐡𝐞𝐥𝐥𝐨'), token('𝐡𝐞𝐥𝐩𝐬'))).toEqual(0);
			});

			it('Different CJK ideographs are not similar', function() {
				// CJK Unified Ideographs Extension B
				expect(tokenComparer.compare(token('\u{20000}\u{20001}\u{20002}'), token('\u{20000}\u{20001}\u{20003}'))).toEqual(0);
			});

			it('A word with a typo is similar', function() {
				expect(tokenComparer.compare(token('𝐨𝐫𝐝𝐞𝐫𝐬𝐬'), token('𝐨𝐫𝐝𝐞𝐫𝐬'))).toBeGreaterThan(0);
			});
		});

		describe('Words with a negating prefix', function() {
			it('activate is not deactivate', function() {
				expect(tokenComparer.compare(token('deactivate'), token('activate'))).toEqual(0);
			});

			it('subscribe is not unsubscribe', function() {
				expect(tokenComparer.compare(token('unsubscribe'), token('subscribe'))).toEqual(0);
			});

			it('Phrase with deactivate does not match activate', async function() {
				const resolver = newPhrases()
					.phrase('deactivate account')
					.toMatcher(en);

				const m = await resolver.match('activate account');
				expect(m).toBeNull();
			});

			it('Phrase with unsubscribe does not match subscribe when fuzzy is off', async function() {
				const resolver = newPhrases()
					.phrase('unsubscribe from newsletter')
					.toMatcher(en);

				const m = await resolver.match('subscribe from newsletter', { fuzzy: false });
				expect(m).toBeNull();
			});
		});
	});
});
