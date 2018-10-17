import GraphBuilder from '../graph/builder';
import { LanguageSpecificValue, ParsingValue } from './base';

const DEFAULT_MAPPER = v => v;

export default function(values, textMapper) {
	if(! textMapper) {
		textMapper = DEFAULT_MAPPER;
	}
	return new LanguageSpecificValue(language => {
		const builder = new GraphBuilder(language)
			.allowPartial();

			values.forEach(value => {
			builder.add(textMapper(value), value);
		});

		return new ParsingValue(builder.toMatcher(), {
			supportsPartial: true
		});
	});
}
