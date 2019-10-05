import { Phrase } from '../src/resolver/Phrase';
import { isDeepEqual } from '../src/utils/equality';
import { ExpressionPartType } from '../src/resolver/expression/ExpressionPartType';

describe('Resolved Phrase', () => {

	describe('Equality', () => {

		it('Match with no expression and values should match', () => {
			const a = new Phrase();
			const b = new Phrase();
			expect(isDeepEqual(a, b)).toBe(true);
		});

		it('Different expressions should match', () => {
			const a = new Phrase();
			a.expression = [ { type: ExpressionPartType.Text, source: { start: 0, end: 0} } ];
			const b = new Phrase();
			b.expression = [ ];
			expect(isDeepEqual(a, b)).toBe(true);
		});

		it('Different values should not match', () => {
			const a = new Phrase();
			a.values = createMap('one', true);
			const b = new Phrase();
			b.values = createMap('one', false);
			expect(isDeepEqual(a, b)).toBe(false);
		});

	});
});

function createMap(id: string, value: any) {
	const m = new Map();
	m.set(id, value);
	return m;
}
