import { BigDecimal } from 'numeric-types/decimal';
import { BigInteger } from 'numeric-types/integer';

import { intentsBuilder } from '../src/index.js';
import { en, english } from '../src/language/en/index.js';
import { sv, swedish } from '../src/language/sv/index.js';
import { localeMatchOptions } from '../src/matching/index.js';
import { newPhrases } from '../src/resolver/newPhrases.js';
import { integerValue } from '../src/values/integer.js';
import { numberValue } from '../src/values/number.js';

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

		it('en-ZA reads a comma as the decimal separator', async function() {
			const language = english('en-ZA');
			expect(await numberValue().matcher(language).match('1,5')).toEqual(BigDecimal.parse('1.5'));
			expect(await numberValue().matcher(language).match('1,000')).toEqual(BigDecimal.parse('1.000'));
			expect(await numberValue().matcher(language).match('1.5')).toBeNull();
		});

		it('en-ZA groups digits with a space', async function() {
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
			expect(await numberValue().matcher(sv).match('1.5')).toBeNull();
			expect(await integerValue().matcher(sv).match('1.000')).toBeNull();
		});

		it('sv-FI reads numbers as sv-SE does', async function() {
			expect(await numberValue().matcher(swedish('sv-FI')).match('1 000,5')).toEqual(BigDecimal.parse('1000.5'));
		});

		it('The locale in the options of a match decides the separators', async function() {
			expect(await numberValue().matcher(en).match('1,5', { locale: 'en-ZA' })).toEqual(BigDecimal.parse('1.5'));
			expect(await numberValue().matcher(sv).match('1.5', { locale: 'en-US' })).toEqual(BigDecimal.parse('1.5'));
		});

		it('A separator set directly wins over the locale', async function() {
			const matcher = numberValue().matcher(sv);
			expect(await matcher.match('1.5', { decimalSeparator: '.' })).toEqual(BigDecimal.parse('1.5'));
			expect(await matcher.match('1,000.5', { decimalSeparator: '.', groupSeparator: ',' })).toEqual(BigDecimal.parse('1000.5'));
		});

		it('A number within a phrase is read with the locale', async function() {
			const matcher = intentsBuilder(english('en-ZA'))
				.add('pay', newPhrases().value('amount', numberValue()).phrase('pay {amount} rand').build())
				.build();

			const match = await matcher.match('pay 1,5 rand');
			expect(match?.values.amount).toEqual(BigDecimal.parse('1.5'));
		});

		it('A number is written with the decimal separator of the locale', async function() {
			const generator = intentsBuilder(english('en-ZA'))
				.add('pay', newPhrases().value('amount', numberValue()).phrase('pay {amount}').build())
				.buildGenerator();

			expect(await generator.generate('pay', { amount: BigDecimal.parse('2.4') })).toEqual('pay 2,4');
		});

		it('The options of a locale name its separators', function() {
			expect(localeMatchOptions('en-US')).toMatchObject({ decimalSeparator: '.', groupSeparator: ',' });
			expect(localeMatchOptions('de-DE')).toMatchObject({ decimalSeparator: ',', groupSeparator: '.' });
		});
	});
});
