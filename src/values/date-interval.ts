import { KnownGraphs } from '../language/index.js';
import { mapDateInterval } from '../type-datetime/index.js';

import { LanguageSpecificValue, ParsingValue } from './base.js';

export function dateIntervalValue() {
	return new LanguageSpecificValue(language => new ParsingValue(
		language.findGraph(KnownGraphs.DateInterval),
		{
			mapper: mapDateInterval
		}
	));
}
