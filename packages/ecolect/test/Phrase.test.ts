import { ExpressionPartType } from '../src/resolver/expression/ExpressionPartType.js';
import { TextPart } from '../src/resolver/expression/TextPart.js';
import { Phrase } from '../src/resolver/Phrase.js';

describe('Phrase', function() {
	describe('clone', function() {
		function phrase() {
			const p = new Phrase<{ customer: string }>();
			p.score = 0.75;
			p.values = { customer: 'Test' };
			const text: TextPart = {
				type: ExpressionPartType.Text,
				value: 'orders for',
				source: { start: 0, end: 10 }
			};
			p.expression = [ text ];
			return p;
		}

		it('Score is copied', function() {
			expect(phrase().clone().score).toEqual(0.75);
		});

		it('Values are copied', function() {
			expect(phrase().clone().values).toEqual({ customer: 'Test' });
		});

		it('Expression is copied', function() {
			expect(phrase().clone().expression).toEqual(phrase().expression);
		});

		it('Values are not shared with the phrase copied from', function() {
			const original = phrase();
			const copy = original.clone();

			copy.values.customer = 'Changed';

			expect(original.values.customer).toEqual('Test');
		});

		it('Expression is not shared with the phrase copied from', function() {
			const original = phrase();
			const copy = original.clone();

			copy.expression[0].source.start = 100;

			expect(original.expression[0].source.start).toEqual(0);
		});
	});
});
