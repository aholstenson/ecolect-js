import { tokenize } from '../src/language/tokens/tokenize';
import { TokenizerInput, TokenData, Tokens } from '../src/language/tokens';

function checkTokens(tokens: Tokens, raw: string[]) {
	expect(tokens.length).toEqual(raw.length);

	for(let i=0; i<raw.length; i++) {
		expect(tokens[i].raw).toEqual(raw[i]);
	}
}

function testTokenizer(t: TokenizerInput): TokenData[] {
	return [
		{
			raw: t.raw,
			normalized: t.raw,
			stemmed: t.raw,
			short: false,
			skippable: false
		}
	];
}

describe('Language', function() {
	describe('Utils: Tokenization', function() {
		it('Single token', function() {
			const tokens = tokenize('hello', testTokenizer);
			expect(tokens.length).toEqual(1);
			expect(tokens[0].raw).toEqual('hello');
			expect(tokens[0].start).toEqual(0);
			expect(tokens[0].stop).toEqual(5);
		});

		it('Multiple tokens', function() {
			const tokens = tokenize('hello world', testTokenizer);
			expect(tokens.length).toEqual(2);
			expect(tokens[0].raw).toEqual('hello');
			expect(tokens[1].raw).toEqual('world');
		});

		it('Single to multiple tokens', function() {
			const tokens = tokenize('can\'t', t => {
				return [
					{
						raw: 'ca',
						normalized: 'can',
						stemmed: 'can',
						short: false,
						skippable: false
					},
					{
						raw: 'n\'t',
						normalized: 'not',
						stemmed: 'not',
						short: false,
						skippable: false
					}
				];
			});
			expect(tokens.length).toEqual(2);
			expect(tokens[0].normalized).toEqual('can');
			expect(tokens[0].start).toEqual(0);
			expect(tokens[0].stop).toEqual(2);

			expect(tokens[1].normalized).toEqual('not');
			expect(tokens[1].start).toEqual(2);
			expect(tokens[1].stop).toEqual(5);
		});

		describe('Spliting', function() {
			it('Parenthesies', function() {
				const tokens = tokenize('(abc)', testTokenizer);
				checkTokens(tokens, [ '(', 'abc', ')']);
			});

			it('Brackets', function() {
				const tokens = tokenize('[abc]', testTokenizer);
				checkTokens(tokens, [ '[', 'abc', ']']);
			});

			it('Exclamation marks', function() {
				checkTokens(
					tokenize('abc!', testTokenizer),
					[ 'abc', '!']
				);

				checkTokens(
					tokenize('a!bc', testTokenizer),
					[ 'a', '!', 'bc' ]
				);
			});

			it('Question marks', function() {
				checkTokens(
					tokenize('abc?', testTokenizer),
					[ 'abc', '?']
				);

				checkTokens(
					tokenize('a?bc', testTokenizer),
					[ 'a', '?', 'bc' ]
				);
			});

			it('Period', function() {
				checkTokens(
					tokenize('abc.', testTokenizer),
					[ 'abc', '.']
				);

				checkTokens(
					tokenize('a.bc', testTokenizer),
					[ 'a', '.', 'bc' ]
				);
			});

			it('Comma', function() {
				checkTokens(
					tokenize('abc,', testTokenizer),
					[ 'abc', ',']
				);

				checkTokens(
					tokenize('a,bc', testTokenizer),
					[ 'a', ',', 'bc' ]
				);
			});

			it('Numbers', function() {
				checkTokens(
					tokenize('12', testTokenizer),
					[ '12' ]
				);

				checkTokens(
					tokenize('12.20', testTokenizer),
					[ '12', '.', '20' ]
				);

				checkTokens(
					tokenize('12.20SEK', testTokenizer),
					[ '12', '.', '20', 'SEK' ]
				);

				checkTokens(
					tokenize('12SEK', testTokenizer),
					[ '12', 'SEK' ]
				);

				checkTokens(
					tokenize('SEK12', testTokenizer),
					[ 'SEK', '12' ]
				);

				checkTokens(
					tokenize('$12.20', testTokenizer),
					[ '$', '12', '.', '20' ]
				);

				checkTokens(
					tokenize('€12.20', testTokenizer),
					[ '€', '12', '.', '20' ]
				);
			});
		});
	});

	describe('Utils: Raw Value', function() {
		it('Single token', function() {
			const tokens = tokenize('hello', testTokenizer);
			const raw = tokens.raw();
			expect(raw).toEqual('hello');
		});

		it('Multiple tokens', function() {
			const tokens = tokenize('hello world', testTokenizer);
			const raw = tokens.raw();
			expect(raw).toEqual('hello world');
		});
	});
});
