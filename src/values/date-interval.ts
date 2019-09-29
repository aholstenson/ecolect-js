import { LanguageSpecificValue, ParsingValue } from './base';
import { KnownGraphs } from '../graph/KnownGraphs';
import { mapDateInterval } from '../time/date-intervals';

export function dateIntervalValue() {
	return new LanguageSpecificValue(language => new ParsingValue(
		language.findGraph(KnownGraphs.DateInterval),
		{
			mapper: mapDateInterval
		}
	));
}
