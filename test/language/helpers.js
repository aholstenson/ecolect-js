import { expect } from 'chai';
import { format } from 'date-fns';

function formatDate(d) {
	if(! d) return 'current time';

	return format(d, 'yyyy-MM-dd HH:mm');
}

function formatOptions(opts) {
	let t = formatDate(opts.now);

	for(const key of Object.keys(opts)) {
		if(key === 'now') continue;

		t += ', ' + key + '=' + opts[key];
	}

	return t;
}

function createTester(f, matcher) {
	return function(expr, opts, v) {
		f(expr + ' [' + formatOptions(opts) + ']', () => {
			return matcher(expr, opts)
				.then(r => {
					expect(r).to.deep.equal(v);
				});
		});
	};
}

export function testRunner(matcher) {
	const r = (text, options) => matcher.match(text, options);

	const func = createTester(it, r);
	func.only = createTester(it.only, r);
	func.skip = createTester(it.skip, r);
	return func;
}
