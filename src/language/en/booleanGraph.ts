import { LanguageGraphFactory } from '../LanguageGraphFactory';
import { GraphBuilder } from '../../graph/GraphBuilder';

export const booleanGraph: LanguageGraphFactory<boolean> = {
	id: 'boolean',

	create(language) {
		return new GraphBuilder<boolean>(language)
			.name('boolean')

			.add('true', true)
			.add('on', true)
			.add('yes', true)

			.add('false', false)
			.add('off', false)
			.add('no', false)

			.build();
	}
};
