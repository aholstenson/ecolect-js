import { format } from 'date-fns';
import { EncounterOptions, Matcher } from '../../src/graph/matching';
import { Language } from '../../src/language/language';

function formatDate(d?: Date) {
	if(! d) return 'current time';

	return format(d, 'yyyy-MM-dd HH:mm');
}

function formatOptions(opts: any) {
	let t = formatDate(opts.now);

	for(const key of Object.keys(opts)) {
		if(key === 'now') continue;

		t += ', ' + key + '=' + opts[key];
	}

	return t;
}

type MatchingFunction = (text: string, options: EncounterOptions) => any;

function createTester(f: (name: string, runner: any) => any, matcher: MatchingFunction): TestFunction {
	return function(expr, opts, v) {
		f(expr + ' [' + formatOptions(opts) + ']', () => {
			return matcher(expr, opts)
				.then((r: any) => {
					expect(r).toEqual(v);
				});
		});
	};
}

export function testRunner(lang: Language, matcherId: string): TestRunner {
	const matcher = lang.findMatcher(matcherId);
	if(! matcher) {
		throw new Error('Matcher has not been registered on language');
	}

	return testRunnerViaMatcher(matcher);
}

export function testRunnerViaMatcher(matcher: Matcher<any>): TestRunner {
	const r = (text: string, options: EncounterOptions) => matcher.match(text, options);

	const func = createTester(it, r) as TestRunner;
	func.only = createTester(it.only, r);
	func.skip = createTester(it.skip, r);
	return func;
}


export interface TestFunction {
	(name: string, options: EncounterOptions, data: any): any;
}

export interface TestRunner extends TestFunction {
	only: TestFunction;
	skip: TestFunction;
}
