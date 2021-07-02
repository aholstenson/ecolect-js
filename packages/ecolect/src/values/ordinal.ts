import { KnownGraphs } from '@ecolect/language';
import { mapOrdinal } from '@ecolect/type-numbers';

import { LanguageSpecificValue, ParsingValue } from './base';

export function ordinalValue() {
	return new LanguageSpecificValue(language => new ParsingValue(
		language.findGraph(KnownGraphs.Ordinal),
		{
			mapper: mapOrdinal
		}
	));
}
