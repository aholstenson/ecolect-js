import { KnownGraphs } from '@ecolect/language';
import { mapDateInterval } from '@ecolect/type-datetime';

import { LanguageSpecificValue, ParsingValue } from './base';

export function dateIntervalValue() {
	return new LanguageSpecificValue(language => new ParsingValue(
		language.findGraph(KnownGraphs.DateInterval),
		{
			mapper: mapDateInterval
		}
	));
}
