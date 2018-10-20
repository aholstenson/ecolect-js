import GraphBuilder from '../../graph/builder';

export default function(language) {
	return function(graph) {
		const builder = new GraphBuilder(language)
			.name('repeating[' + graph.options.name + ']')

			.skipPunctuation();

		// If the value supports partial matching so does this repeating value
		if(graph.options.supportsPartial) {
			builder.allowPartial();
		}

		if(graph.options.mapper) {
			// If the graph has requested that matches are mapped - map each match
			builder.mapResults(values => values.map(graph.options.mapper));
		}

		// Add the value and how it can be repeated
		return builder
			.add(graph, v => [ v[0] ])

			.add([ GraphBuilder.result(), GraphBuilder.result() ], v => v[0].concat(v[1]))
			.add([ GraphBuilder.result(), 'and', GraphBuilder.result() ], v => v[0].concat(v[1]));
	};
}
