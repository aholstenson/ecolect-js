import { LocalDate } from 'datetime-types';

import { intentsBuilder } from '../../../src/index.js';
import { sv } from '../../../src/language/sv/index.js';
import { newPhrases } from '../../../src/resolver/newPhrases.js';
import { anyTextValue, dateIntervalValue, dateValue, integerValue } from '../../../src/values/index.js';
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
				day: 1
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
				day: 2
			}));
		});

		it('Picks an intent without values', async function() {
			const match = await matcher.match('visa ordrar', options);
			assertNotNull(match);
			expect(match.id).toEqual('ordrar');
		});
	});

	describe('Particles', function() {
		const matcher = intentsBuilder(sv)
			.add('on', newPhrases().phrase('Sätt på lampan').build())
			.add('move', newPhrases().phrase('Flytta mötet till fredag').build())
			.build();

		it('A phrase with a particle matches', async function() {
			const match = await matcher.match('sätt på lampan', options);
			assertNotNull(match);
			expect(match.id).toEqual('on');
		});

		it('A particle can not be left out, as it changes the verb', async function() {
			expect(await matcher.match('sätt lampan', options)).toBeNull();
		});

		it('till can not be left out', async function() {
			expect(await matcher.match('flytta mötet fredag', options)).toBeNull();
		});
	});

	describe('Single quotes', function() {
		const matcher = intentsBuilder(sv)
			.add('play', newPhrases().value('song', anyTextValue()).phrase('Spela {song}').build())
			.build();

		const carMatcher = newPhrases()
			.phrase('Visa Lars bil')
			.toMatcher(sv);

		it('Free text in single quotes is read without the quotes', async function() {
			const match = await matcher.match('spela \'Änglar\'', options);
			expect(match?.values.song).toEqual('Änglar');
		});

		it('Free text in curly single quotes is read without the quotes', async function() {
			const match = await matcher.match('spela ‘Änglar’', options);
			expect(match?.values.song).toEqual('Änglar');
		});

		it('A possessive with an apostrophe matches the phrase without it', async function() {
			assertNotNull(await carMatcher.match('visa Lars\' bil', options));
		});

		it('Free text keeps an apostrophe within it as typed', async function() {
			const match = await matcher.match('spela Lars\' låt', options);
			expect(match?.values.song).toEqual('Lars\' låt');
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
