import { GraphBuilder } from '../../graph/builder';
import { Matcher } from '../../graph/matching';
import { Language } from '../language';

export function createRepeating<V>(language: Language) {
	return function(graph: Matcher<V>) {
		const builder = new GraphBuilder<V[]>(language)
			.name('repeating[' + graph.options.name + ']')

			.skipPunctuation();

		// If the value supports partial matching so does this repeating value
		if(graph.options.supportsPartial) {
			builder.allowPartial();
		}

		if(graph.options.mapper) {
			// If the graph has requested that matches are mapped - map each match
			const mapper = graph.options.mapper;
			builder.mapResults((values, encounter) => values.map(v => mapper(v, encounter)));
		}

		// Add the value and how it can be repeated
		return builder
			.add(graph, v => [ v[0] ])

			.add([ GraphBuilder.result(), GraphBuilder.result() ], v => v[0].concat(v[1]))
			.add([ GraphBuilder.result(), 'and', GraphBuilder.result() ], v => v[0].concat(v[1]));
	};
}
