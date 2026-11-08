import { LocalDate } from 'datetime-types';

import { porterStemmer } from '../../../src/language/en/algorithms/porterStemmer.js';
import { en } from '../../../src/language/en/index.js';
import { tokenizer } from '../../../src/language/en/tokenizer.js';
import { newPhrases } from '../../../src/resolver/newPhrases.js';
import { dateValue } from '../../../src/values/index.js';
import { assertNotNull } from '../../assertions.js';
import { expectGrowth } from '../../growth.js';

describe('English', function() {
	describe('Tokenization', function() {
		it('Simple: Hello World', function() {
			const tokens = tokenizer('hello world');
			expect(tokens.length).toEqual(2);
			expect(tokens[0].raw).toEqual('hello');
			expect(tokens[1].raw).toEqual('world');
		});

		it('Contraction: Wasn\'t', function() {
			const tokens = tokenizer('Wasn\'t');
			expect(tokens.length).toEqual(2);
			expect(tokens[0].normalized).toEqual('was');
			expect(tokens[1].normalized).toEqual('not');
		});

		it('Contraction: Can\'t', function() {
			const tokens = tokenizer('Can\'t');
			expect(tokens.length).toEqual(2);
			expect(tokens[0].normalized).toEqual('can');
			expect(tokens[1].normalized).toEqual('not');
		});

		it('Contraction: I\'m', function() {
			const tokens = tokenizer('I\'m');
			expect(tokens.length).toEqual(2);
			expect(tokens[0].normalized).toEqual('i');
			expect(tokens[1].normalized).toEqual('am');
		});

		it('Contraction: You\'re', function() {
			const tokens = tokenizer('You\'re');
			expect(tokens.length).toEqual(2);
			expect(tokens[0].normalized).toEqual('you');
			expect(tokens[1].normalized).toEqual('are');
		});

		it('Contraction: They\'ll', function() {
			const tokens = tokenizer('They\'ll');
			expect(tokens.length).toEqual(2);
			expect(tokens[0].normalized).toEqual('they');
			expect(tokens[1].normalized).toEqual('will');
		});

		it('Contraction with curly apostrophe: What’s', function() {
			const tokens = tokenizer('What’s');
			expect(tokens.map(t => t.normalized)).toEqual([ 'what', 'is' ]);
		});

		it('Contraction with curly apostrophe: Don’t', function() {
			const tokens = tokenizer('Don’t');
			expect(tokens.map(t => t.normalized)).toEqual([ 'do', 'not' ]);
		});

		it('Contraction with curly apostrophe keeps the typed text', function() {
			const tokens = tokenizer('I’m here');
			expect(tokens.map(t => t.raw)).toEqual([ 'I', '’m', 'here' ]);
			expect(tokens.raw()).toEqual('I’m here');
		});

		it('Simple: `:`', function() {
			const tokens = tokenizer(':');
			expect(tokens.length).toEqual(1);
			expect(tokens[0].raw).toEqual(':');
		});

		it('Words without punctuation are kept as they are', function() {
			const tokens = tokenizer('Todos due tomorrow 2018');
			expect(tokens.map(t => t.raw)).toEqual([ 'Todos', 'due', 'tomorrow', '2018' ]);
			expect(tokens.map(t => t.normalized)).toEqual([ 'todos', 'due', 'tomorrow', '2018' ]);
		});

		it('Contraction without apostrophe: cannot', function() {
			const tokens = tokenizer('Cannot');
			expect(tokens.map(t => t.raw)).toEqual([ 'Can', 'not' ]);
		});

		it('Contraction without apostrophe: gonna', function() {
			const tokens = tokenizer('gonna');
			expect(tokens.map(t => t.raw)).toEqual([ 'gon', 'na' ]);
		});

		it('Quotes are split from words', function() {
			const tokens = tokenizer('"hello"');
			expect(tokens.length).toEqual(3);
			expect(tokens[1].raw).toEqual('hello');
		});

		it('Quotes keep their raw text and offsets', function() {
			const input = 'say "hello" now';
			const tokens = tokenizer(input);
			for(let i = 0; i < tokens.length; i++) {
				expect(input.slice(tokens[i].start, tokens[i].stop)).toEqual(tokens[i].raw);
				if(i > 0) {
					expect(tokens[i - 1].stop).toBeLessThanOrEqual(tokens[i].start);
				}
			}
		});

		it('Curly double quotes are read as straight double quotes', function() {
			const tokens = tokenizer('say \u201Chello\u201D');
			expect(tokens.map(t => t.raw)).toEqual([ 'say', '\u201C', 'hello', '\u201D' ]);
			expect(tokens.map(t => t.normalized)).toEqual([ 'say', '"', 'hello', '"' ]);
		});

		it('Single quotes are split from words', function() {
			const tokens = tokenizer('\'jazz\'');
			expect(tokens.map(t => t.raw)).toEqual([ '\'', 'jazz', '\'' ]);
		});

		it('Contraction that starts with an apostrophe is kept', function() {
			const tokens = tokenizer('rock \'n roll');
			expect(tokens.map(t => t.raw)).toEqual([ 'rock', '\'n', 'roll' ]);
		});

		it('Possessive can be skipped', function() {
			const tokens = tokenizer('John\'s car');
			expect(tokens.map(t => t.raw)).toEqual([ 'John', '\'s', 'car' ]);
			expect(tokens[1].skippable).toBe(true);
		});

		it('Punctuation is split from words', function() {
			const tokens = tokenizer('hello, world!');
			expect(tokens.map(t => t.raw)).toEqual([ 'hello', ',', 'world', '!' ]);
			expect(tokens[1].punctuation).toBe(true);
			expect(tokens[3].punctuation).toBe(true);
		});
	});

	describe('Long words', function() {
		it('Tokenizing a long word is fast', async function() {
			const tokens = tokenizer('a'.repeat(50000));
			expect(tokens.length).toEqual(1);

			await expectGrowth(
				size => tokenizer('a'.repeat(size)),
				{ from: 12500, to: 50000, degree: 1 }
			);
		});

		it('Stemming a long word is fast', function() {
			return expectGrowth(
				size => porterStemmer('a'.repeat(size) + 'b'),
				{ from: 12500, to: 50000, degree: 1 }
			);
		});
	});

	describe('Phrases', function() {
		const matcher = newPhrases()
			.value('when', dateValue())
			.phrase('show orders')
			.phrase('due {when}')
			.toMatcher(en);

		it('Zero width space between words', async function() {
			const m = await matcher.match('show\u200B orders');
			expect(m).not.toBeNull();
		});

		it('Trailing right-to-left mark', async function() {
			const m = await matcher.match('show orders\u200F');
			expect(m).not.toBeNull();
		});

		it('Zero width space after a value', async function() {
			const m = await matcher.match('due tomorrow\u200B', { now: new Date(2026, 10, 8) });
			assertNotNull(m);
			expect(m.values.when).toEqual(LocalDate.of(2026, 11, 9));
		});

		it('Word in single quotes matches the word', async function() {
			const resolver = newPhrases()
				.phrase('play jazz')
				.toMatcher(en);

			const m = await resolver.match('play \'jazz\'');
			expect(m).not.toBeNull();
		});

		it('Possessive matches phrase without it', async function() {
			const resolver = newPhrases()
				.phrase('show John orders')
				.toMatcher(en);

			const m = await resolver.match('show John\'s orders');
			expect(m).not.toBeNull();
		});

		it('Contraction with is still matches the phrase written out', async function() {
			const resolver = newPhrases()
				.phrase('what is the time')
				.toMatcher(en);

			const m = await resolver.match('what\'s the time');
			expect(m).not.toBeNull();
		});

		it('Curly apostrophe matches phrase with straight apostrophe', async function() {
			const resolver = newPhrases()
				.phrase('don\'t remind me')
				.toMatcher(en);

			const m = await resolver.match('don’t remind me');
			expect(m).not.toBeNull();
		});
	});
});
