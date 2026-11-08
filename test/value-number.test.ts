import { BigDecimal } from 'numeric-types/decimal';

import { IntentsBuilder } from '../src/IntentsBuilder.js';
import { en } from '../src/language/en/index.js';
import { newPhrases } from '../src/resolver/newPhrases.js';
import { anyTextValue, integerValue, numberValue } from '../src/values/index.js';

import { assertNotNull } from './assertions.js';

describe('Value: Number', function() {
	describe('In intents', function() {
		const intents = new IntentsBuilder(en)
			.add('pay', newPhrases()
				.value('amount', numberValue())
				.phrase('pay {amount} dollars')
				.build()
			)
			.build();

		it('Digits with suffix followed by a smaller number', function() {
			return intents.match('pay 2 thousand 5 dollars')
				.then(r => {
					assertNotNull(r);
					expect(r.values.amount).toEqual(BigDecimal.fromNumber(2005));
				});
		});

		it('Long number phrase is matched quickly', async function() {
			const start = performance.now();
			await intents.match('pay ' + Array(18).fill('1 thousand').join(' ') + ' dollars');
			expect(performance.now() - start).toBeLessThan(500);
		}, 1000);
	});

	describe('Large integers and signs in intents', function() {
		const signs = new IntentsBuilder(en)
			.add('pay', newPhrases()
				.value('amount', numberValue())
				.phrase('pay {amount} dollars')
				.build()
			)
			.add('note', newPhrases()
				.value('text', anyTextValue())
				.phrase('pay {text}')
				.build()
			)
			.build();

		const intents = new IntentsBuilder(en)
			.add('count', newPhrases()
				.value('n', integerValue())
				.phrase('count {n}')
				.build()
			)
			.add('free', newPhrases()
				.value('t', anyTextValue())
				.phrase('count {t}')
				.build()
			)
			.build();

		it('Number with two signs still gives a match', function() {
			return signs.match('pay - - 5 dollars')
				.then(r => {
					assertNotNull(r);
				});
		});

		it('Number with two minus words still gives a match', function() {
			return signs.match('pay minus minus 5 dollars')
				.then(r => {
					assertNotNull(r);
					expect(r.id).toEqual('note');
				});
		});

		it('Integer too large for a number still gives a match', function() {
			return intents.match('count 100 billion billion billion')
				.then(r => {
					assertNotNull(r);
				});
		});
	});
});
