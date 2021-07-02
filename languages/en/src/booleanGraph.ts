import { GraphBuilder } from '@ecolect/graph';
import { LanguageGraphFactory } from '@ecolect/language';

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
