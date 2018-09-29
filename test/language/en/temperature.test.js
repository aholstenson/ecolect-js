'use strict';

const chai = require('chai');
const expect = chai.expect;

const en = require('../../../language/en');
const temperature = (text, options) => en.temperature.match(text, options);

describe('English', function() {

	describe('Temperature', function() {
		it('one', function() {
			return temperature('one')
				.then(v =>
					expect(v).to.deep.equal({ value: 1, unit: 'unknown' })
				);
		});

		it('one degree', function() {
			return temperature('one degree')
				.then(v =>
					expect(v).to.deep.equal({ value: 1, unit: 'unknown' })
				);
		});

		it('one degree (default unit)', function() {
			return temperature('one degree', {
				temperature: 'celsius'
			})
				.then(v =>
					expect(v).to.deep.equal({ value: 1, unit: 'celsius' })
				);
		});

		it('40 F', function() {
			return temperature('40 F')
				.then(v =>
					expect(v).to.deep.equal({ value: 40, unit: 'fahrenheit' })
				);
		});

		it('40 fahrenheit', function() {
			return temperature('40 F')
				.then(v =>
					expect(v).to.deep.equal({ value: 40, unit: 'fahrenheit' })
				);
		});

		it('40 C', function() {
			return temperature('40 C')
				.then(v =>
					expect(v).to.deep.equal({ value: 40, unit: 'celsius' })
				);
		});

		it('40 celsius', function() {
			return temperature('40 celsius')
				.then(v =>
					expect(v).to.deep.equal({ value: 40, unit: 'celsius' })
				);
		});
	});

});
