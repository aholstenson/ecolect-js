import { GraphBuilder } from '../../graph/builder';
import { ValueMatcherFactory } from '../value-matcher-factory';
import { Language } from '../language';

export const booleanMatcher: ValueMatcherFactory<boolean> = {
	id: 'boolean',

	create(language: Language) {
		return new GraphBuilder<boolean>(language)
			.name('boolean')

			.add('true', true)
			.add('on', true)
			.add('yes', true)

			.add('false', false)
			.add('off', false)
			.add('no', false)

			.onlyBest()

			.toMatcher();
	}
};
