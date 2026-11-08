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
