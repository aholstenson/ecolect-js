import { KnownGraphs } from '@ecolect/language';
import { mapInteger } from '@ecolect/type-numbers';

import { LanguageSpecificValue, ParsingValue } from './base.js';

export function integerValue() {
	return new LanguageSpecificValue(language => new ParsingValue(
		language.findGraph(KnownGraphs.Integer),
		{
			mapper: mapInteger
		}
	));
}
