import { KnownGraphs } from '../language/index.js';
import { mapOrdinal } from '../type-numbers/index.js';

import { LanguageSpecificValue, ParsingValue } from './base.js';

export function ordinalValue() {
	return new LanguageSpecificValue(language => new ParsingValue(
		language.findGraph(KnownGraphs.Ordinal),
		{
			mapper: mapOrdinal
		}
	));
}
