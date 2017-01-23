'use strict';

const chai = require('chai');
const expect = chai.expect;

const lang = require('../language/en');
const Builder = require('../resolver/builder');

const any = require('../values/any');
const date = require('../values/date');

describe('Resolver', function() {
	describe('Graph without value', function() {
		const resolver = new Builder(lang)
			.add('one')
			.add('one two three')
			.build();

		it('#1', function() {
			return resolver.match('one')
				.then(r => expect(r.best).to.not.be.null);
		});

		it('#2', function() {
			return resolver.match('one two three')
				.then(r => expect(r.best).to.not.be.null);
		});

		it('#3', function() {
			return resolver.match('one two')
				.then(r => expect(r.best).to.be.null);
		});
	});

	describe('Graph with value of type any', function() {
		const resolver = new Builder(lang)
			.value('a', any())
			.add('{a}')
			.add('one {a}')
			.add('{a} one')
			.build();

		it('#1', function() {
			return resolver.match('one')
				.then(r => {
					expect(r.best).to.not.be.null;
					expect(r.best.values.a).to.equal('one');
					expect(r.matches.length).to.equal(1);
				});
		});

		it('#2', function() {
			return resolver.match('one test')
				.then(r => {
					expect(r.best).to.not.be.null;
					expect(r.best.values.a).to.equal('test');
					expect(r.matches.length).to.equal(1);
				});
		});

		it('#3', function() {
			return resolver.match('test one')
			.then(r => {
				expect(r.best).to.not.be.null;
				expect(r.best.values.a).to.equal('test');
				expect(r.matches.length).to.equal(1);
			});
		});

		it('#4', function() {
			return resolver.match('one one')
			.then(r => {
				expect(r.best).to.not.be.null;
				expect(r.best.values.a).to.equal('one');
				expect(r.matches.length).to.equal(1);
			});
		});
	});

	describe('Graph with date', function() {
		const resolver = new Builder(lang)
			.value('date', date())
			.add('stuff {date}')
			.add('{date} stuff')
			.add('stuff {date} cookie')
			.build();

		it('start', function() {
			return resolver.match('today stuff')
				.then(r => {
					expect(r.best).to.not.be.null;
					expect(r.matches.length).to.equal(1);
				});
		});

		it('middle', function() {
			return resolver.match('stuff today cookie')
				.then(r => {
					expect(r.best).to.not.be.null;
					expect(r.matches.length).to.equal(1);
				});
		});

		it('middle (no match)', function() {
			return resolver.match('stuff today a b')
				.then(r => {
					expect(r.best).to.be.null;
				});
		});

		it('end', function() {
			return resolver.match('stuff today')
				.then(r => {
					expect(r.best).to.not.be.null;
					expect(r.matches.length).to.equal(1);
				});
		});

		it('start (complex)', function() {
			return resolver.match('tomorrow at 14:00 stuff')
				.then(r => {
					expect(r.best).to.not.be.null;
					expect(r.matches.length).to.equal(1);
				});
		});

		it('end (complex)', function() {
			return resolver.match('stuff tomorrow at 14:00')
				.then(r => {
					expect(r.best).to.not.be.null;
					expect(r.matches.length).to.equal(1);
				});
		});

		it('range (no match)', function() {
			return resolver.match('stuff Jan 12-14')
			.then(r => {
				expect(r.best).to.be.null;
			});
		});
	});

	describe('Partial matching', function() {
		const resolver = new Builder(lang)
			.add('hello world')
			.build();

		it('Full token', function() {

			return resolver.match('hello', {
				partial: true
			}).then(r => {
				expect(r.matches.length).to.equal(1);
			})
		});

		it('Partial token', function() {

			return resolver.match('he', {
				partial: true
			}).then(r => {
				expect(r.matches.length).to.equal(1);
			})
		})
	});

	describe('Partial matching with value', function() {
		const resolver = new Builder(lang)
			.value('test', {
				match(encounter) {
					if(encounter.text() === 'world') {
						return true;
					}

					return null;
				}
			})
			.add('hello {test}')
			.build();

		it('No value', function() {

			return resolver.match('hello', {
				partial: true
			}).then(r => {
				expect(r.matches.length).to.equal(1);
			})
		});

		it('Value - valid', function() {
			return resolver.match('hello world', {
				partial: true
			}).then(r => {
				expect(r.matches.length).to.equal(1);
			})
		});

		it('Value - invalid', function() {
			return resolver.match('hello cookie', {
				partial: true
			}).then(r => {
				expect(r.matches.length).to.equal(0);
			})
		})
	});
})
