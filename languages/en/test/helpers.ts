import { format } from 'date-fns';

import { Graph, GraphMatcher } from '@ecolect/graph';
import { Language, LanguageGraphFactory } from '@ecolect/language';

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

type MatchingFunction = (text: string, options: any) => any;

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

export function testRunner<V, O, Opts extends object>(
	lang: Language,
	graphFactory: LanguageGraphFactory<V>,
	mapper: (value: V, options: Opts) => O
): TestRunner {
	const graph = lang.graph(graphFactory);
	return testRunnerViaGraph(lang, graph, mapper);
}

export function testRunnerViaGraph<V, O>(
	lang: Language,
	graph: Graph<V>,
	mapper: (value: V, options: any) => O
): TestRunner {
	const matcher = new GraphMatcher(graph, {
		mapper: (m, options) => mapper(m.data, options)
	});

	const r = (text: string, options: any) => matcher.match(text, options);

	const func = createTester(it, r) as TestRunner;
	func.only = createTester(it.only, r);
	func.skip = createTester(it.skip, r);
	return func;
}


export type TestFunction = (name: string, options: any, data: any) => any;

export interface TestRunner extends TestFunction {
	only: TestFunction;
	skip: TestFunction;
}
