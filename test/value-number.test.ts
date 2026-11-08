import { BigDecimal } from 'numeric-types/decimal';

import { IntentsBuilder } from '../src/IntentsBuilder.js';
import { en } from '../src/language/en/index.js';
import { newPhrases } from '../src/resolver/newPhrases.js';
import { numberValue } from '../src/values/index.js';

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
	});
});
