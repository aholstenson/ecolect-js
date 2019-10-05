import { en } from '../src/language/en';
import { ResolverBuilder } from '../src/resolver/ResolverBuilder';
import { ValueEncounter } from '../src/resolver/ValueEncounter';
import { customValue } from '../src/values';
import { newPhrases } from '../src/resolver/newPhrases';

const items = [ 'Balloons', 'Cookie Co' ];
async function match(encounter: ValueEncounter<string>) {
	const text = encounter.text.toLowerCase();
	for(const v of items) {
		if(v.toLowerCase().startsWith(text)) {
			encounter.match(v);

			if(! encounter.partial) return;
		}
	}
}

describe('Value: Custom', function() {
	describe('Full matching', function() {
		const resolver = newPhrases()
			.value('company', customValue(match))
			.phrase('{company}')
			.phrase('{company} company')
			.toMatcher(en);

		it('Invalid company', function() {
			return resolver.match('ABC')
				.then(r => {
					expect(r).toBeNull();
				});
		});

		it('Single token company', function() {
			return resolver.match('Balloons')
				.then(r => {
					expect(r).not.toBeNull();
					expect(r.values.company).toEqual('Balloons');
				});
		});

		it('Multi token company', function() {
			return resolver.match('Cookie Co')
				.then(r => {
					expect(r).not.toBeNull();
					expect(r.values.company).toEqual('Cookie Co');
				});
		});

		it('Multi token company with suffix', function() {
			return resolver.match('Cookie Co company')
				.then(r => {
					expect(r).not.toBeNull();
					expect(r.values.company).toEqual('Cookie Co');
				});
		});
	});

	describe('Partial matching', function() {
		const resolver = newPhrases()
			.value('company',  customValue(match))
			.phrase('{company}')
			.phrase('{company} company')
			.toMatcher(en);

		it('Invalid company', function() {
			return resolver.matchPartial('A')
				.then(r => {
					expect(r.length).toEqual(0);
				});
		});

		it('Single token company', function() {
			return resolver.matchPartial('Ba')
				.then(r => {
					expect(r.length).toEqual(1);
					expect(r[0].values.company).toEqual('Balloons');
				});
		});

		it('Multi token company', function() {
			return resolver.matchPartial('C')
				.then(r => {
					expect(r.length).toEqual(1);
					expect(r[0].values.company).toEqual('Cookie Co');
				});
		});

		it('Multi token company with suffix', function() {
			return resolver.matchPartial('Cookie company')
				.then(r => {
					expect(r.length).toEqual(1);
					expect(r[0].values.company).toEqual('Cookie Co');
				});
		});

	});
});
