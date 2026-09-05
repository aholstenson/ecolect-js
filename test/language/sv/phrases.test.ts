import { LocalDate } from 'datetime-types';

import { intentsBuilder } from '../../../src/index.js';
import { sv } from '../../../src/language/sv/index.js';
import { newPhrases } from '../../../src/resolver/newPhrases.js';
import { dateIntervalValue, dateValue, integerValue } from '../../../src/values/index.js';
import { assertNotNull } from '../../assertions.js';

const options = { now: new Date(2020, 0, 1) };

describe('Swedish', function() {
	/*
	 * Values are named in English, as the library is, while the words of the
	 * phrase around them are Swedish.
	 */
	describe('Phrases', function() {
		const matcher = newPhrases()
			.value('when', dateIntervalValue())
			.phrase('[visa|lista] ordrar (från|i) {when}')
			.toMatcher(sv);

		it('Both groups say their first alternative', async function() {
			const match = await matcher.match('visa ordrar från idag', options);
			assertNotNull(match);
			assertNotNull(match.values.when);
			expect(match.values.when.start).toEqual(LocalDate.from({
				year: 2020,
				month: 1,
				dayOfMonth: 1
			}));
		});

		it('The group that may be left out is left out', async function() {
			const match = await matcher.match('ordrar i denna månad', options);
			assertNotNull(match);
		});

		it('A phrase that does not match returns nothing', async function() {
			const match = await matcher.match('visa kunder', options);
			expect(match).toBeNull();
		});
	});

	describe('Intents', function() {
		const matcher = intentsBuilder(sv)
			.add('påminnelse', newPhrases()
				.value('what', integerValue())
				.value('when', dateValue())
				.phrase('påminn mig om uppgift {what} {when}')
				.build()
			)
			.add('ordrar', newPhrases()
				.phrase('visa ordrar')
				.build()
			)
			.build();

		it('Picks the intent the words belong to', async function() {
			const match = await matcher.match('påminn mig om uppgift 42 imorgon', options);
			assertNotNull(match);
			expect(match.id).toEqual('påminnelse');

			if(match.id !== 'påminnelse') return;
			expect(match.values.when).toEqual(LocalDate.from({
				year: 2020,
				month: 1,
				dayOfMonth: 2
			}));
		});

		it('Picks an intent without values', async function() {
			const match = await matcher.match('visa ordrar', options);
			assertNotNull(match);
			expect(match.id).toEqual('ordrar');
		});
	});

	describe('Vocabulary', function() {
		const language = sv.withVocabulary({
			synonyms: {
				kunder: [ 'klienter', 'konton' ]
			},

			skippable: [ 'vänligen' ]
		});

		const matcher = newPhrases()
			.phrase('visa kunder')
			.toMatcher(language);

		it('The word in the phrase matches', async function() {
			assertNotNull(await matcher.match('visa kunder', options));
		});

		it('A synonym of the word matches', async function() {
			assertNotNull(await matcher.match('visa klienter', options));
		});

		it('A skippable word may be added to the input', async function() {
			assertNotNull(await matcher.match('vänligen visa konton', options));
		});
	});
});
