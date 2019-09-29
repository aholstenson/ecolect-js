import { LanguageSpecificValue, ParsingValue } from './base';
import { KnownGraphs } from '../graph/KnownGraphs';
import { mapDuration } from '../time/durations';

export function dateTimeDurationValue() {
	return new LanguageSpecificValue(language => new ParsingValue(
		language.findGraph(KnownGraphs.DateTimeDuration),
		{
			mapper: mapDuration
		}
	));
}
