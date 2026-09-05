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
