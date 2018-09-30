'use strict';

const chai = require('chai');
const expect = chai.expect;

const lang = require('../language/en');
const boolean = require('../values/boolean');

describe('Value: Matchers', () => {

	it('Can parse string', () => {
		const matcher = boolean().matcher(lang);
		return matcher('yes')
			.then(v => expect(v).to.equal(true));
	});

	it('Can handle invalid value', () => {
		const matcher = boolean().matcher(lang);
		return matcher('cookies')
			.then(v => expect(v).to.equal(null));
	});

	it('Can handle non-string values', () => {
		const matcher = boolean().matcher(lang);
		return matcher(2029)
			.then(v => expect(v).to.equal(null));
	});
});
