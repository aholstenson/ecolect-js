import { GraphBuilder } from '@ecolect/graph';

import { LanguageSpecificValue, ParsingValue } from './base';

const DEFAULT_MAPPER = <V>(v: V) => String(v);

export function enumerationValue<V>(values: V[], textMapper?: (value: V) => string) {
	const mapper = textMapper ? textMapper : DEFAULT_MAPPER;

	return new LanguageSpecificValue(language => {
		let builder = new GraphBuilder<V>(language)
			.allowPartial();

		values.forEach(value => {
			builder = builder.add(mapper(value), value);
		});

		return new ParsingValue(builder.build(), {
			partialBlankWhenNoToken: true,

			mapper: value => value
		});
	});
}
