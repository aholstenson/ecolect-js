'use strict';

const chai = require('chai');
const expect = chai.expect;

const lang = require('../language/en');
const Builder = require('../resolver/builder');

const any = require('../values/any');
const date = require('../values/date');
const number = require('../values/number');
const boolean = require('../values/boolean');

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

		/*

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
		*/
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
				expect(r.matches.length).to.equal(1);
				expect(r.best.values.test).to.equal(undefined);
				expect(r.best.expression[1]).to.deep.equal({
					type: 'value',
					id: 'test',
					value: null
				});
			})
		});
	});

	describe('Graph with number', function() {
		const resolver = new Builder(lang)
			.value('number', number())
			.add('stuff {number}')
			.add('a {number} c')
			.build();

		it('With a number', function() {
			return resolver.match('stuff 2')
				.then(results => {
					expect(results.matches.length).to.equal(1);
					expect(results.best.values.number).to.deep.equal({
						value: 2
					});
				});
		});

		it('Without a number', function() {
			return resolver.match('stuff abc')
				.then(results => {
					expect(results.matches.length).to.equal(0);
				});
		});

		it('With a number followed by garbage', function() {
			return resolver.match('stuff 2 abc')
				.then(results => {
					expect(results.matches.length).to.equal(0);
				});
		});

		it('With a more complex number', function() {
			return resolver.match('stuff 2 thousand')
				.then(results => {
					expect(results.matches.length).to.equal(1);
					expect(results.best.values.number).to.deep.equal({
						value: 2000
					});
				});
		});

		it('With a number and trailing valid token', function() {
			return resolver.match('a two hundred c')
				.then(results => {
					expect(results.matches.length).to.equal(1);
					expect(results.best.values.number).to.deep.equal({
						value: 200
					});
				});
		});
	});

	describe('Graph with boolean', function() {
		const resolver = new Builder(lang)
			.value('boolean', boolean())
			.add('stuff {boolean}')
			.add('a {boolean} c')
			.build();

		it('With a boolean', function() {
			return resolver.match('stuff off')
				.then(results => {
					expect(results.matches.length).to.equal(1);
					expect(results.best.values.boolean).to.equal(false);
				});
		});

		it('Without a boolean', function() {
			return resolver.match('stuff abc')
				.then(results => {
					expect(results.matches.length).to.equal(0);
				});
		});

		it('With a boolean followed by garbage', function() {
			return resolver.match('stuff off abc')
				.then(results => {
					expect(results.matches.length).to.equal(0);
				});
		});

		it('With yes', function() {
			return resolver.match('stuff yes')
				.then(results => {
					expect(results.matches.length).to.equal(1);
					expect(results.best.values.boolean).to.equal(true);
				});
		});

		it('With a boolean and trailing valid token', function() {
			return resolver.match('a false c')
				.then(results => {
					expect(results.matches.length).to.equal(1);
					expect(results.best.values.boolean).to.equal(false);
				});
		});
	});

	describe('Graph with custom value', function() {
		const values = [
			'one',
			'two',
			'three'
		];
		const resolver = new Builder(lang)
			.value('name', function(encounter) {
				let text = encounter.text();
				if(encounter.partial) {
					return values.filter(f => {
						return f.indexOf(text) === 0;
					});
				} else {
					if(values.indexOf(text) >= 0) {
						return text;
					}
				}
			})
			.add('do {name}')
			.build();

		it('Match', function() {
			return resolver.match('do one')
				.then(results => {
					expect(results.matches.length).to.equal(1);
					expect(results.best.values.name).to.equal('one');
				});
		});

		it('No match', function() {
			return resolver.match('do four')
				.then(results => {
					expect(results.matches.length).to.equal(0);
				});
		});

		it('Partial', function() {
			return resolver.match('do t', {
				partial: true
			})
				.then(results => {
					expect(results.matches.length).to.equal(2);
				});
		});
	})
})
