import { LanguageSpecificValue, ParsingValue } from './base';
import { mapDuration } from '../time/durations';
import { KnownGraphs } from '../graph/KnownGraphs';

export function dateDurationValue() {
	return new LanguageSpecificValue(language => new ParsingValue(
		language.findGraph(KnownGraphs.DateDuration),
		{
			mapper: mapDuration
		}
	));
}
