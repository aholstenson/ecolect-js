import { GraphBuilder } from '../../graph/index.js';
import { LanguageGraphFactory } from '../index.js';

export const booleanGraph: LanguageGraphFactory<boolean> = {
	id: 'boolean',

	create(language) {
		return new GraphBuilder<boolean>(language)
			.name('boolean')

			.add('sant', true)
			.add('sann', true)
			.add('på', true)
			.add('ja', true)

			.add('falskt', false)
			.add('falsk', false)
			.add('av', false)
			.add('nej', false)

			.build();
	}
};
