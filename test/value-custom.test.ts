import { en } from '../src/language/en';
import { ResolverBuilder } from '../src/resolver/builder';
import { ValueEncounter } from '../src/resolver/value';
import { customValue } from '../src/values';

const items = [ 'Balloons', 'Cookie Co' ];
async function match(encounter: ValueEncounter<string>) {
	const text = encounter.text().toLowerCase();
	for(const v of items) {
		if(v.toLowerCase().startsWith(text)) {
			encounter.match(v);

			if(! encounter.partial) return;
		}
	}
}

describe('Value: Custom', function() {
	describe('Full matching', function() {
		const resolver = new ResolverBuilder(en)
			.value('company', customValue(match))
			.add('{company}')
			.add('{company} company')
			.build();

		it('Invalid company', function() {
			return resolver.match('ABC')
				.then(results => {
					expect(results.matches.length).toEqual(0);
				});
		});

		it('Single token company', function() {
			return resolver.match('Balloons')
				.then(results => {
					expect(results.matches.length).toEqual(1);
					expect(results.best.values.get('company')).toEqual('Balloons');
				});
		});

		it('Multi token company', function() {
			return resolver.match('Cookie Co')
				.then(results => {
					expect(results.matches.length).toEqual(1);
					expect(results.best.values.get('company')).toEqual('Cookie Co');
				});
		});

		it('Multi token company with suffix', function() {
			return resolver.match('Cookie Co company')
				.then(results => {
					expect(results.matches.length).toEqual(1);
					expect(results.best.values.get('company')).toEqual('Cookie Co');
				});
		});
	});

	describe('Partial matching', function() {
		const resolver = new ResolverBuilder(en)
			.value('company',  customValue(match))
			.add('{company}')
			.add('{company} company')
			.build();

		it('Invalid company', function() {
			return resolver.match('A', { partial: true })
				.then(results => {
					expect(results.matches.length).toEqual(0);
				});
		});

		it('Single token company', function() {
			return resolver.match('Ba', { partial: true })
				.then(results => {
					expect(results.matches.length).toEqual(1);
					expect(results.best.values.get('company')).toEqual('Balloons');
				});
		});

		it('Multi token company', function() {
			return resolver.match('C', { partial: true })
				.then(results => {
					expect(results.matches.length).toEqual(1);
					expect(results.best.values.get('company')).toEqual('Cookie Co');
				});
		});

		it('Multi token company with suffix', function() {
			return resolver.match('Cookie company', { partial: true })
				.then(results => {
					expect(results.matches.length).toEqual(1);
					expect(results.best.values.get('company')).toEqual('Cookie Co');
				});
		});

	});
});
