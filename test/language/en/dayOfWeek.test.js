'use strict';

const chai = require('chai');
const expect = chai.expect;

const en = require('../../../language/en');
const dayOfWeek = (text, options) => en.dayOfWeek.match(text, options);

describe('English', function() {

	describe('Day of Week', function() {
		it('Friday', function() {
			return dayOfWeek('Friday')
				.then(v =>
					expect(v).to.deep.equal({ value: 5 })
				);
		});

		it('Tue', function() {
			return dayOfWeek('Tue')
				.then(v =>
					expect(v).to.deep.equal({ value: 2 })
				);
		});

		it('on Tue', function() {
			return dayOfWeek('Tue')
				.then(v =>
					expect(v).to.deep.equal({ value: 2 })
				);
		});
	});

});
