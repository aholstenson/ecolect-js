import { tokenizer } from '../../../src/language/en/tokenizer.js';

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

		it('Punctuation is split from words', function() {
			const tokens = tokenizer('hello, world!');
			expect(tokens.map(t => t.raw)).toEqual([ 'hello', ',', 'world', '!' ]);
			expect(tokens[1].punctuation).toBe(true);
			expect(tokens[3].punctuation).toBe(true);
		});
	});
});
