import { BigInteger } from 'numeric-types/integer';

import { intentsBuilder } from '../../../src/index.js';
import { sv } from '../../../src/language/sv/index.js';
import { tokenComparer } from '../../../src/language/sv/tokenComparer.js';
import { tokenizer } from '../../../src/language/sv/tokenizer.js';
import { newPhrases } from '../../../src/resolver/newPhrases.js';
import { dateValue } from '../../../src/values/date.js';
import { integerValue } from '../../../src/values/integer.js';

/**
 * Tokenize a single word with the Swedish tokenizer.
 *
 * @param word -
 *   the word to tokenize
 * @returns
 *   the token of the word
 */
function token(word: string) {
	return tokenizer(word)[0];
}

const now = { now: new Date(2017, 0, 24) };

describe('Swedish', function() {
	describe('Token comparer', function() {
		describe('Words typed without å, ä and ö', function() {
			it('pa matches på with a lower score than på', function() {
				const folded = tokenComparer.compare(token('på'), token('pa'));
				expect(folded).toBeGreaterThan(0);
				expect(folded).toBeLessThan(tokenComparer.compare(token('på'), token('på')));
			});

			it('A word typed with the letters does not match a word without them', function() {
				expect(tokenComparer.compare(token('satt'), token('sätt'))).toEqual(0);
			});

			it('A phrase matches when typed without the letters', async function() {
				const matcher = newPhrases()
					.phrase('Sätt på lampan')
					.toMatcher(sv);

				expect(await matcher.match('satt pa lampan', now)).not.toBeNull();
			});

			it('The phrase with the word as typed wins', async function() {
				const matcher = intentsBuilder(sv)
					.add('put', newPhrases().phrase('Sätt på lampan').build())
					.add('sat', newPhrases().phrase('Satt på lampan').build())
					.build();

				expect((await matcher.match('satt på lampan', now))?.id).toEqual('sat');
				expect((await matcher.match('sätt på lampan', now))?.id).toEqual('put');
			});

			it('A date matches when typed without the letters', async function() {
				const match = await dateValue().matcher(sv).match('nasta mandag', now);
				expect(match).toEqual({ year: 2017, month: 1, day: 30 });
			});

			it('A compound number matches when typed without the letters', async function() {
				const match = await integerValue().matcher(sv).match('tvahundratjugotva', now);
				expect(match).toEqual(BigInteger.fromNumber(222));
			});
		});

		describe('Words that are spelled almost the same', function() {
			it('kvart does not match kvartal', function() {
				expect(tokenComparer.compare(token('kvartal'), token('kvart'))).toEqual(0);
				expect(tokenComparer.compare(token('kvart'), token('kvartal'))).toEqual(0);
			});

			it('julas does not match jul', function() {
				expect(tokenComparer.compare(token('jul'), token('julas'))).toEqual(0);
			});

			it('för does not match före', function() {
				expect(tokenComparer.compare(token('före'), token('för'))).toEqual(0);
			});

			it('om en kvart is not a date', async function() {
				expect(await dateValue().matcher(sv).match('om en kvart', now)).toBeNull();
			});

			it('i julas is not July', async function() {
				expect(await dateValue().matcher(sv).match('i julas', now)).toBeNull();
			});

			it('om ett kvartal is a date', async function() {
				const match = await dateValue().matcher(sv).match('om ett kvartal', now);
				expect(match).toEqual({ year: 2017, month: 4, day: 24 });
			});
		});
	});
});
