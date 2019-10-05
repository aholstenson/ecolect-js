import { format } from 'date-fns';
import { Language } from '../../src/language/Language';

import { EncounterOptions, GraphMatcher, Encounter } from '../../src/graph/matching';
import { Graph } from '../../src/graph/Graph';
import { LanguageGraphFactory } from '../../src/language/LanguageGraphFactory';

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

export function testRunner<V, O>(
	lang: Language,
	graphFactory: LanguageGraphFactory<V>,
	mapper: (value: V, encounter: Encounter) => O
): TestRunner {
	const graph = lang.graph(graphFactory);
	return testRunnerViaGraph(lang, graph, mapper);
}

export function testRunnerViaGraph<V, O>(
	lang: Language,
	graph: Graph<V>,
	mapper: (value: V, encounter: Encounter) => O
): TestRunner {
	const matcher = new GraphMatcher(lang, graph, {
		mapper: (m, encounter) => mapper(m.data, encounter)
	});

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
