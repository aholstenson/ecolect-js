'use strict';

const chai = require('chai');
const expect = chai.expect;

const en = require('../../../language/en');
const ordinal = text => en.ordinal.match(text);

describe('English', function() {

	describe('Ordinal', function() {
		it('one', function() {
			return ordinal('one')
				.then(v =>
					expect(v).to.deep.equal({ value: 1 })
				);
		});

		it('1st', function() {
			return ordinal('1st')
				.then(v =>
					expect(v).to.deep.equal({ value: 1 })
				);
		});

		it('2 1st', function() {
			return ordinal('2 1st')
				.then(v =>
					expect(v).to.deep.equal({ value: 21 })
				);
		});

		it('stuff st', function() {
			return ordinal('stuff st')
				.then(v =>
					expect(v).to.deep.equal(null)
				);
		});
	});

});
