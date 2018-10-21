import { expect } from 'chai';

import ResolvedIntent from '../src/resolver/resolved-intent';
import { isDeepEqual } from '../src/utils/equality';

describe('Resolved Intent', () => {

	describe('Equality', () => {

		it('Same intent with no expression and values should match', () => {
			const a = new ResolvedIntent('test');
			const b = new ResolvedIntent('test');
			expect(isDeepEqual(a, b)).is.true;
		});

		it('Different intent with no expression and values should not match', () => {
			const a = new ResolvedIntent('test1');
			const b = new ResolvedIntent('test2');
			expect(isDeepEqual(a, b)).is.false;
		});

		it('Same intent with different expressions should match', () => {
			const a = new ResolvedIntent('test');
			a.expression = [ true ];
			const b = new ResolvedIntent('test');
			b.expression = [ false ];
			expect(isDeepEqual(a, b)).is.true;
		});

		it('Same intent with different values should not match', () => {
			const a = new ResolvedIntent('test');
			a.values = { one: true };
			const b = new ResolvedIntent('test');
			b.values = { one: false };
			expect(isDeepEqual(a, b)).is.false;
		});

	});
});
