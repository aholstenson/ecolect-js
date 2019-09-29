import { ResolvedIntent } from '../src/resolver/ResolvedIntent';
import { isDeepEqual } from '../src/utils/equality';
import { ExpressionPartType } from '../src/resolver/expression/ExpressionPartType';

describe('Resolved Intent', () => {

	describe('Equality', () => {

		it('Same intent with no expression and values should match', () => {
			const a = new ResolvedIntent('test');
			const b = new ResolvedIntent('test');
			expect(isDeepEqual(a, b)).toBe(true);
		});

		it('Different intent with no expression and values should not match', () => {
			const a = new ResolvedIntent('test1');
			const b = new ResolvedIntent('test2');
			expect(isDeepEqual(a, b)).toBe(false);
		});

		it('Same intent with different expressions should match', () => {
			const a = new ResolvedIntent('test');
			a.expression = [ { type: ExpressionPartType.Text, source: { start: 0, end: 0} } ];
			const b = new ResolvedIntent('test');
			b.expression = [ ];
			expect(isDeepEqual(a, b)).toBe(true);
		});

		it('Same intent with different values should not match', () => {
			const a = new ResolvedIntent('test');
			a.values = createMap('one', true);
			const b = new ResolvedIntent('test');
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
