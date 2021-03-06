import { tokenizer } from '../src/tokenizer';

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
	});
});
