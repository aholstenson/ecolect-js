import { Graph, GraphBuilder } from '@ecolect/graph';
import { Language } from '@ecolect/language';

export function createRepeating<V>(language: Language) {
	return function(graph: Graph<V>) {
		const builder: GraphBuilder<V[]> = new GraphBuilder<V[]>(language)
			.skipPunctuation()
			.name('repeating[' + graph.options.name + ']');

		// If the value supports partial matching so does this repeating value
		if(graph.options.supportsPartial) {
			builder.allowPartial();
		}

		// Add the value and how it can be repeated
		return builder
			.add(graph, v => [ v[0] ])

			.add([ GraphBuilder.result(), GraphBuilder.result() ], v => v[0].concat(v[1]))
			.add([ GraphBuilder.result(), 'and', GraphBuilder.result() ], v => v[0].concat(v[1]));
	};
}
