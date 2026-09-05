import { LocalDate } from 'datetime-types';

import { en } from '@ecolect/language-en';

import { newPhrases } from '../src/resolver/newPhrases.js';
import { dateValue } from '../src/values/index.js';

import { assertNotNull } from './assertions.js';

describe('Language: Vocabulary', function() {
	describe('Synonyms', function() {
		const language = en.withVocabulary({
			synonyms: {
				customers: [ 'clients', 'accounts' ]
			}
		});

		const resolver = newPhrases()
			.phrase('show customers')
			.toMatcher(language);

		it('Word used in phrase', function() {
			return resolver.match('show customers')
				.then(r => expect(r).not.toBeNull());
		});

		it('First synonym', function() {
			return resolver.match('show clients')
				.then(r => expect(r).not.toBeNull());
		});

		it('Second synonym', function() {
			return resolver.match('show accounts')
				.then(r => expect(r).not.toBeNull());
		});

		it('Unrelated word', function() {
			return resolver.match('show invoices')
				.then(r => expect(r).toBeNull());
		});
	});

	describe('Synonym used in phrase', function() {
		const language = en.withVocabulary({
			synonyms: {
				customers: [ 'clients' ]
			}
		});

		const resolver = newPhrases()
			.phrase('show clients')
			.toMatcher(language);

		it('Word the synonym points at', function() {
			return resolver.match('show customers')
				.then(r => expect(r).not.toBeNull());
		});
	});

	describe('Skippable words', function() {
		const language = en.withVocabulary({
			skippable: [ 'please', 'all' ]
		});

		const resolver = newPhrases()
			.phrase('show customers')
			.toMatcher(language);

		it('Without skippable words', function() {
			return resolver.match('show customers')
				.then(r => expect(r).not.toBeNull());
		});

		it('Leading skippable word', function() {
			return resolver.match('please show customers')
				.then(r => expect(r).not.toBeNull());
		});

		it('Skippable word within phrase', function() {
			return resolver.match('show all customers')
				.then(r => expect(r).not.toBeNull());
		});

		it('Several skippable words', function() {
			return resolver.match('please show all customers')
				.then(r => expect(r).not.toBeNull());
		});
	});

	describe('Known graphs', function() {
		const language = en.withVocabulary({
			synonyms: {
				customers: [ 'clients' ]
			}
		});

		const resolver = newPhrases()
			.value('when', dateValue())
			.phrase('clients added {when}')
			.toMatcher(language);

		it('Value is still resolved', function() {
			return resolver.match('customers added today', { now: new Date(2021, 0, 24) })
				.then(r => {
					assertNotNull(r);
					expect(r.values.when).toEqual(LocalDate.of(2021, 1, 24));
				});
		});
	});

	describe('Source language', function() {
		const resolver = newPhrases()
			.phrase('show customers')
			.toMatcher(en);

		it('Does not read the vocabulary of the derived language', function() {
			en.withVocabulary({ synonyms: { customers: [ 'clients' ] } });

			return resolver.match('show clients')
				.then(r => expect(r).toBeNull());
		});
	});

	describe('Invalid vocabulary', function() {
		it('Synonym of several words', function() {
			expect(() => en.withVocabulary({
				synonyms: {
					customers: [ 'paying clients' ]
				}
			})).toThrow();
		});

		it('Skippable word of several words', function() {
			expect(() => en.withVocabulary({
				skippable: [ 'if you please' ]
			})).toThrow();
		});
	});
});
