import { BigDecimal } from 'numeric-types/decimal';
import { BigInteger } from 'numeric-types/integer';

import { intentsBuilder } from '../src/index.js';
import { en, english } from '../src/language/en/index.js';
import { sv, swedish } from '../src/language/sv/index.js';
import { localeMatchOptions } from '../src/matching/index.js';
import { newPhrases } from '../src/resolver/newPhrases.js';
import { integerValue } from '../src/values/integer.js';
import { numberValue } from '../src/values/number.js';

/*
 * The separators of a locale come from `Intl`, and its data can differ
 * between JavaScript engines. Some versions of WebKit write `en-ZA` numbers
 * with a `.` as the decimal separator, so the tests of `en-ZA` run only when
 * the engine writes `12 345,6` for it.
 */
const zaWritesCommaAndSpace = new Intl.NumberFormat('en-ZA').format(12345.6).replace(/\s/gu, ' ') === '12 345,6';

describe('Locale', function() {
	describe('Numbers', function() {
		it('en reads a point as the decimal separator', async function() {
			expect(await numberValue().matcher(en).match('1.5')).toEqual(BigDecimal.parse('1.5'));
			expect(await numberValue().matcher(en).match('1,5')).toBeNull();
		});

		it('en reads a comma as the group separator', async function() {
			expect(await integerValue().matcher(en).match('1,000,000')).toEqual(BigInteger.fromNumber(1000000));
			expect(await numberValue().matcher(en).match('1,000.25')).toEqual(BigDecimal.parse('1000.25'));
		});

		it.runIf(zaWritesCommaAndSpace)('en-ZA reads a comma as the decimal separator', async function() {
			const language = english('en-ZA');
			expect(await numberValue().matcher(language).match('1,5')).toEqual(BigDecimal.parse('1.5'));
			expect(await numberValue().matcher(language).match('1,000')).toEqual(BigDecimal.parse('1.000'));
			expect(await numberValue().matcher(language).match('1.5', { numberSeparators: 'strict' })).toBeNull();
		});

		it.runIf(zaWritesCommaAndSpace)('en-ZA groups digits with a space', async function() {
			const language = english('en-ZA');
			expect(await numberValue().matcher(language).match('1 000,5')).toEqual(BigDecimal.parse('1000.5'));
			expect(await integerValue().matcher(language).match('1,000')).toBeNull();
		});

		it('en-DE groups digits with a point', async function() {
			const language = english('en-DE');
			expect(await integerValue().matcher(language).match('1.000.000')).toEqual(BigInteger.fromNumber(1000000));
			expect(await numberValue().matcher(language).match('1.000,5')).toEqual(BigDecimal.parse('1000.5'));
		});

		it('sv reads a comma as the decimal separator', async function() {
			expect(await numberValue().matcher(sv).match('1,5')).toEqual(BigDecimal.parse('1.5'));
			expect(await numberValue().matcher(sv).match('1,000')).toEqual(BigDecimal.parse('1.000'));
		});

		it('sv with strict separators reads only a comma', async function() {
			const options = { numberSeparators: 'strict' } as const;
			expect(await numberValue().matcher(sv).match('1.5', options)).toBeNull();
			expect(await integerValue().matcher(sv).match('1.000', options)).toBeNull();
		});

		it('sv-FI reads numbers as sv-SE does', async function() {
			expect(await numberValue().matcher(swedish('sv-FI')).match('1 000,5')).toEqual(BigDecimal.parse('1000.5'));
		});

		it('The locale in the options of a match decides the separators', async function() {
			expect(await numberValue().matcher(en).match('1,5', { locale: 'en-DE' })).toEqual(BigDecimal.parse('1.5'));
			expect(await numberValue().matcher(sv).match('1.5', { locale: 'en-US' })).toEqual(BigDecimal.parse('1.5'));
		});

		it('A separator set directly wins over the locale', async function() {
			const matcher = numberValue().matcher(sv);
			expect(await matcher.match('1.5', { decimalSeparator: '.' })).toEqual(BigDecimal.parse('1.5'));
			expect(await matcher.match('1,000.5', { decimalSeparator: '.', groupSeparator: ',' })).toEqual(BigDecimal.parse('1000.5'));
		});

		it('A number within a phrase is read with the locale', async function() {
			const matcher = intentsBuilder(english('en-DE'))
				.add('pay', newPhrases().value('amount', numberValue()).phrase('pay {amount} euro').build())
				.build();

			const match = await matcher.match('pay 1,5 euro');
			expect(match?.values.amount).toEqual(BigDecimal.parse('1.5'));
		});

		it('A number is written with the decimal separator of the locale', async function() {
			const generator = intentsBuilder(english('en-DE'))
				.add('pay', newPhrases().value('amount', numberValue()).phrase('pay {amount}').build())
				.buildGenerator();

			expect(await generator.generate('pay', { amount: BigDecimal.parse('2.4') })).toEqual('pay 2,4');
		});

		describe('Separators the locale does not use', function() {
			it('sv reads a point as a decimal separator by default', async function() {
				const matcher = numberValue().matcher(sv);
				expect(await matcher.match('24.00')).toEqual(BigDecimal.parse('24.00'));
				expect(await matcher.match('1.5')).toEqual(BigDecimal.parse('1.5'));
				expect(await matcher.match('1234.567')).toEqual(BigDecimal.parse('1234.567'));
			});

			it('sv reads a point before three digits as a group separator', async function() {
				expect(await numberValue().matcher(sv).match('1.000')).toEqual(BigDecimal.parse('1000'));
				expect(await integerValue().matcher(sv).match('1.000')).toEqual(BigInteger.fromNumber(1000));
				expect(await integerValue().matcher(sv).match('1.000.000')).toEqual(BigInteger.fromNumber(1000000));
				expect(await numberValue().matcher(sv).match('1.000,50')).toEqual(BigDecimal.parse('1000.50'));
			});

			it('sv reads a point before three digits as a decimal separator when asked', async function() {
				const matcher = numberValue().matcher(sv);
				const options = { ambiguousSeparator: 'decimal' } as const;
				expect(await matcher.match('1.000', options)).toEqual(BigDecimal.parse('1.000'));
				expect(await matcher.match('1.000.000', options)).toEqual(BigDecimal.parse('1000000'));
				expect(await matcher.match('1.000,5', options)).toEqual(BigDecimal.parse('1000.5'));
				expect(await integerValue().matcher(sv).match('1.000', options)).toBeNull();
			});

			it('en-US does not read a comma as a decimal separator by default', async function() {
				expect(await numberValue().matcher(en).match('24,00')).toBeNull();
			});

			it('en-US reads a comma as a decimal separator when lenient', async function() {
				const matcher = numberValue().matcher(en);
				const options = { numberSeparators: 'lenient' } as const;
				expect(await matcher.match('24,00', options)).toEqual(BigDecimal.parse('24.00'));
				expect(await matcher.match('1,5', options)).toEqual(BigDecimal.parse('1.5'));
				expect(await matcher.match('1,000', options)).toEqual(BigDecimal.parse('1000'));
				expect(await matcher.match('1,000,000', options)).toEqual(BigDecimal.parse('1000000'));
				expect(await matcher.match('1,000.5', options)).toEqual(BigDecimal.parse('1000.5'));
			});

			it('en-US reads a comma before three digits as a decimal separator when asked', async function() {
				const matcher = numberValue().matcher(en);
				const options = { numberSeparators: 'lenient', ambiguousSeparator: 'decimal' } as const;
				expect(await matcher.match('1,000', options)).toEqual(BigDecimal.parse('1.000'));
				expect(await matcher.match('1,000,000', options)).toEqual(BigDecimal.parse('1000000'));
				expect(await matcher.match('1,000.5', options)).toEqual(BigDecimal.parse('1000.5'));
			});

			it('de-DE reads a point as a decimal separator when lenient', async function() {
				const matcher = numberValue().matcher(english('en-DE'));
				expect(await matcher.match('24.50')).toBeNull();
				expect(await matcher.match('24.50', { numberSeparators: 'lenient' })).toEqual(BigDecimal.parse('24.50'));
				expect(await matcher.match('1.000', { numberSeparators: 'lenient' })).toEqual(BigDecimal.parse('1000'));
			});

			it('A separator set directly turns off the other separator', async function() {
				const matcher = numberValue().matcher(sv);
				expect(await matcher.match('1.5', { decimalSeparator: ',' })).toBeNull();
			});

			it('A list of separators reads each of them', async function() {
				const matcher = numberValue().matcher(en);
				const options = { decimalSeparator: [ '.', ',' ], groupSeparator: [] };
				expect(await matcher.match('1,5', options)).toEqual(BigDecimal.parse('1.5'));
				expect(await matcher.match('1.5', options)).toEqual(BigDecimal.parse('1.5'));
				expect(await matcher.match('1,000', options)).toEqual(BigDecimal.parse('1.000'));
			});

			it('The language decides the mode when the match does not', async function() {
				const language = english('en-US', { numberSeparators: 'lenient' });
				const matcher = numberValue().matcher(language);
				expect(await matcher.match('24,00')).toEqual(BigDecimal.parse('24.00'));
				expect(await matcher.match('24,00', { numberSeparators: 'strict' })).toBeNull();
			});

			it('The mode of the language works with the locale of a match', async function() {
				const matcher = numberValue().matcher(swedish('sv-SE', { numberSeparators: 'lenient' }));
				expect(await matcher.match('24,00', { locale: 'en-US' })).toEqual(BigDecimal.parse('24.00'));
				expect(await matcher.match('1,000', { locale: 'en-US' })).toEqual(BigDecimal.parse('1000'));
			});

			it('The language decides how to read an ambiguous separator', async function() {
				const matcher = numberValue().matcher(swedish('sv-SE', { ambiguousSeparator: 'decimal' }));
				expect(await matcher.match('1.000')).toEqual(BigDecimal.parse('1.000'));
			});

			it('A language with options keeps them with a vocabulary', async function() {
				const language = english('en-US', { numberSeparators: 'lenient' }).withVocabulary({});
				expect(await numberValue().matcher(language).match('24,00')).toEqual(BigDecimal.parse('24.00'));
			});

			it('A number within an intent reads the other separator', async function() {
				const matcher = intentsBuilder(sv)
					.add('pay', newPhrases().value('amount', numberValue()).phrase('betala {amount} kr').build())
					.build();

				const match = await matcher.match('betala 24.50 kr');
				expect(match?.values.amount).toEqual(BigDecimal.parse('24.50'));
			});

			it('sv writes numbers with a comma', async function() {
				const generator = intentsBuilder(sv)
					.add('pay', newPhrases().value('amount', numberValue()).phrase('betala {amount}').build())
					.buildGenerator();

				expect(await generator.generate('pay', { amount: BigDecimal.parse('2.4') })).toEqual('betala 2,4');
			});
		});

		it('The options of a locale name its separators', function() {
			expect(localeMatchOptions('en-US')).toMatchObject({ decimalSeparator: '.', groupSeparator: ',' });
			expect(localeMatchOptions('de-DE')).toMatchObject({ decimalSeparator: ',', groupSeparator: '.' });
		});
	});
});
