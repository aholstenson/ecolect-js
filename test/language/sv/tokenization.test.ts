import { swedishStemmer } from '../../../src/language/sv/algorithms/swedishStemmer.js';
import { tokenizer } from '../../../src/language/sv/tokenizer.js';

describe('Swedish', function() {
	describe('Tokenization', function() {
		it('Simple: Hej världen', function() {
			const tokens = tokenizer('hej världen');
			expect(tokens.length).toEqual(2);
			expect(tokens[0].raw).toEqual('hej');
			expect(tokens[1].raw).toEqual('världen');
		});

		it('Words are kept as they are', function() {
			const tokens = tokenizer('Uppgifter senast imorgon 2018');
			expect(tokens.map(t => t.raw)).toEqual([ 'Uppgifter', 'senast', 'imorgon', '2018' ]);
			expect(tokens.map(t => t.normalized)).toEqual([ 'uppgifter', 'senast', 'imorgon', '2018' ]);
		});

		it('Letters with diacritics keep their case folded', function() {
			const tokens = tokenizer('MÅNDAG Öl');
			expect(tokens.map(t => t.normalized)).toEqual([ 'måndag', 'öl' ]);
		});

		it('Ampersand is read as och', function() {
			const tokens = tokenizer('2 dagar & 3 timmar');
			expect(tokens[2].normalized).toEqual('och');
		});

		it('Punctuation is split from words', function() {
			const tokens = tokenizer('hej, världen!');
			expect(tokens.map(t => t.raw)).toEqual([ 'hej', ',', 'världen', '!' ]);
			expect(tokens[1].punctuation).toBe(true);
			expect(tokens[3].punctuation).toBe(true);
		});

		it('A compound number word is split into its words', function() {
			const tokens = tokenizer('Tvåhundratjugotre kronor');
			expect(tokens.map(t => t.raw)).toEqual([ 'Två', 'hundra', 'tjugotre', 'kronor' ]);
			expect(tokens.map(t => t.normalized)).toEqual([ 'två', 'hundra', 'tjugotre', 'kronor' ]);
			expect(tokens.map(t => [ t.start, t.stop ])).toEqual([ [ 0, 3 ], [ 3, 9 ], [ 9, 17 ], [ 18, 24 ] ]);
		});

		it('The longest part of a compound number word is used', function() {
			const tokens = tokenizer('sextiotusen');
			expect(tokens.map(t => t.raw)).toEqual([ 'sextio', 'tusen' ]);
		});

		it('A letter left out where two number words join is read back', function() {
			const tokens = tokenizer('ettusen');
			expect(tokens.map(t => t.raw)).toEqual([ 'et', 'tusen' ]);
			expect(tokens.map(t => t.normalized)).toEqual([ 'ett', 'tusen' ]);
		});

		it('A position can only be the last part of a compound number word', function() {
			expect(tokenizer('tvåhundrafemte').map(t => t.normalized)).toEqual([ 'två', 'hundra', 'femte' ]);
			expect(tokenizer('femtehundra').map(t => t.normalized)).toEqual([ 'femtehundra' ]);
		});

		it('Words with a scale word that are not numbers are kept', function() {
			const tokens = tokenizer('hundratals tusentals hundra');
			expect(tokens.map(t => t.raw)).toEqual([ 'hundratals', 'tusentals', 'hundra' ]);
		});

		it('A long word that is almost a number is read without blocking', function() {
			const word = 'tre'.repeat(5000) + 'hundrax';
			const start = performance.now();
			const tokens = tokenizer(word);
			expect(tokens.length).toEqual(1);
			expect(performance.now() - start).toBeLessThan(1000);
		});

		it('Abbreviations keep their period as a token', function() {
			const tokens = tokenizer('kl. 15');
			expect(tokens.map(t => t.raw)).toEqual([ 'kl', '.', '15' ]);
		});

		it('Prepositions are skippable', function() {
			const tokens = tokenizer('i en vecka');
			expect(tokens[0].skippable).toBe(true);
			expect(tokens[1].skippable).toBe(true);
			expect(tokens[2].skippable).toBe(false);
		});
	});

	describe('Stemming', function() {
		it('Plural and singular of vecka share a stem', function() {
			expect(swedishStemmer('veckor')).toEqual(swedishStemmer('vecka'));
		});

		it('Plural of dag shares a stem with the singular', function() {
			expect(swedishStemmer('dagar')).toEqual('dag');
		});

		it('Genitive s is removed after a consonant', function() {
			expect(swedishStemmer('måndags')).toEqual('måndag');
		});

		it('A trailing s that carries the word is kept', function() {
			expect(swedishStemmer('hus')).toEqual('hus');
		});

		it('Adjective endings are removed', function() {
			expect(swedishStemmer('kraftig')).toEqual('kraft');
		});

		it('The forms of an adjective share a stem', function() {
			expect(swedishStemmer('fattigt')).toEqual(swedishStemmer('fattig'));
		});

		it('Short words are left alone', function() {
			expect(swedishStemmer('år')).toEqual('år');
			expect(swedishStemmer('dag')).toEqual('dag');
		});
	});
});
