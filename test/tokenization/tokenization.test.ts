import type { TokenizerInput, TokenData, Tokens } from '../../src/tokenization/index.js';
import { tokenize } from '../../src/tokenization/index.js';

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

	it('Tokenizer that tokenizes inside its callback', function() {
		let calls = 0;
		const tokens = tokenize('ab cd', t => {
			calls++;
			if(calls > 100) {
				throw new Error('Tokenizer called too many times');
			}

			tokenize(t.raw, testTokenizer);
			return testTokenizer(t);
		});

		checkTokens(tokens, [ 'ab', 'cd' ]);
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
				[ 'abc', '!' ]
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

	describe('Scripts', function() {
		it('Letters with combining marks', function() {
			checkTokens(
				tokenize('café ok', testTokenizer),
				[ 'café', 'ok' ]
			);
		});

		it('Letters outside the Basic Multilingual Plane', function() {
			// Gothic letters
			checkTokens(
				tokenize('𐌰𐌱𐌲 abc', testTokenizer),
				[ '𐌰𐌱𐌲', 'abc' ]
			);
		});

		it('CJK ideographs added after Unicode 9', function() {
			// U+31350 is in CJK Unified Ideographs Extension H (Unicode 15)
			checkTokens(
				tokenize('\u{31350}\u{31351}', testTokenizer),
				[ '\u{31350}\u{31351}' ]
			);
		});

		it('Digits outside the Basic Multilingual Plane', function() {
			// Mathematical bold digits
			checkTokens(
				tokenize('𝟏𝟐a', testTokenizer),
				[ '𝟏𝟐', 'a' ]
			);
		});

		it('Punctuation is marked', function() {
			const tokens = tokenize('hi!', testTokenizer);
			expect(tokens[1].raw).toEqual('!');
			expect(tokens[1].punctuation).toEqual(true);
			expect(tokens[0].punctuation).toBeFalsy();
		});
	});

	describe('Invisible characters', function() {
		it('Zero width space', function() {
			checkTokens(
				tokenize('show\u200B orders', testTokenizer),
				[ 'show', 'orders' ]
			);
		});

		it('Right-to-left mark', function() {
			checkTokens(
				tokenize('show orders\u200F', testTokenizer),
				[ 'show', 'orders' ]
			);
		});

		it('Control characters', function() {
			checkTokens(
				tokenize('\u0000\u0007abc', testTokenizer),
				[ 'abc' ]
			);
		});
	});

	describe('Emoji', function() {
		it('Single emoji', function() {
			checkTokens(
				tokenize('hi😀', testTokenizer),
				[ 'hi', '😀' ]
			);
		});

		it('Emoji with skin tone', function() {
			checkTokens(
				tokenize('👍🏽👍', testTokenizer),
				[ '👍🏽', '👍' ]
			);
		});

		it('Emoji with presentation selector', function() {
			checkTokens(
				tokenize('❤️ok', testTokenizer),
				[ '❤️', 'ok' ]
			);
		});

		it('Zero width joiner sequence', function() {
			checkTokens(
				tokenize('👩‍💻👨‍👩‍👧', testTokenizer),
				[ '👩‍💻', '👨‍👩‍👧' ]
			);
		});

		it('Zero width joiner sequence with skin tones', function() {
			checkTokens(
				tokenize('🧑🏽‍🚀', testTokenizer),
				[ '🧑🏽‍🚀' ]
			);
		});

		it('Country flags', function() {
			checkTokens(
				tokenize('🇸🇪🇺🇸', testTokenizer),
				[ '🇸🇪', '🇺🇸' ]
			);
		});

		it('Subdivision flag', function() {
			const england = '\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}';
			checkTokens(
				tokenize(england + 'x', testTokenizer),
				[ england, 'x' ]
			);
		});

		it('Emoji are not punctuation', function() {
			const tokens = tokenize('😀', testTokenizer);
			expect(tokens[0].punctuation).toBeFalsy();
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
