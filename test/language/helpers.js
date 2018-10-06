'use strict';

const chai = require('chai');
const expect = chai.expect;

function createTester(f, matcher) {
	return function(expr, opts, v) {
		f(expr + ' [' + (opts.now ? opts.now.toString() : 'current time') + ']', () => {
			return matcher(expr, opts)
				.then(r => {
					expect(r).to.deep.equal(v);
				});
		});
	};
}
module.exports.testRunner = function(matcher) {
	const r = (text, options) => matcher.match(text, options);

	const func = createTester(it, r);
	func.only = createTester(it.only, r);
	func.skip = createTester(it.skip, r);
	return func;
};
