import { expect } from 'chai';

import lang from '../src/language/en';
import Builder from '../src/resolver/builder';

const items = [ 'Balloons', 'Cookie Co' ];
function customValue(encounter) {
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
		const resolver = new Builder(lang)
			.value('company', customValue)
			.add('{company}')
			.add('{company} company')
			.build();

		it('Invalid company', function() {
			return resolver.match('ABC')
				.then(results => {
					expect(results.matches.length).to.equal(0);
				});
		});

		it('Single token company', function() {
			return resolver.match('Balloons')
				.then(results => {
					expect(results.matches.length).to.equal(1);
					expect(results.best.values.company).to.equal('Balloons');
				});
		});

		it('Multi token company', function() {
			return resolver.match('Cookie Co')
				.then(results => {
					expect(results.matches.length).to.equal(1);
					expect(results.best.values.company).to.equal('Cookie Co');
				});
		});

		it('Multi token company with suffix', function() {
			return resolver.match('Cookie Co company')
				.then(results => {
					expect(results.matches.length).to.equal(1);
					expect(results.best.values.company).to.equal('Cookie Co');
				});
		});
	});

	describe('Partial matching', function() {
		const resolver = new Builder(lang)
			.value('company', customValue)
			.add('{company}')
			.add('{company} company')
			.build();

		it('Invalid company', function() {
			return resolver.match('A', { partial: true })
				.then(results => {
					expect(results.matches.length).to.equal(0);
				});
		});

		it('Single token company', function() {
			return resolver.match('Ba', { partial: true })
				.then(results => {
					expect(results.matches.length).to.equal(1);
					expect(results.best.values.company).to.equal('Balloons');
				});
		});

		it('Multi token company', function() {
			return resolver.match('C', { partial: true })
				.then(results => {
					expect(results.matches.length).to.equal(1);
					expect(results.best.values.company).to.equal('Cookie Co');
				});
		});

		it('Multi token company with suffix', function() {
			return resolver.match('Cookie company', { partial: true })
				.then(results => {
					expect(results.matches.length).to.equal(1);
					expect(results.best.values.company).to.equal('Cookie Co');
				});
		});

	});
});
