import { GraphBuilder } from '../graph/GraphBuilder';
import { LanguageSpecificValue, ParsingValue } from './base';

const DEFAULT_MAPPER = <V>(v: V) => String(v);

export function enumerationValue<V>(values: V[], textMapper?: (value: V) => string) {
	const mapper = textMapper ? textMapper : DEFAULT_MAPPER;

	return new LanguageSpecificValue(language => {
		const builder = new GraphBuilder(language)
			.allowPartial();

			values.forEach(value => {
			builder.add(mapper(value), value);
		});

		return new ParsingValue(builder.toMatcher(), {
			partialBlankWhenNoToken: true
		});
	});
}
