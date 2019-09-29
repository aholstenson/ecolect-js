import { LanguageSpecificValue, ParsingValue } from './base';
import { KnownGraphs } from '../graph/KnownGraphs';
import { mapDuration } from '../time/durations';

export function timeDurationValue() {
	return new LanguageSpecificValue(language => new ParsingValue(
		language.findGraph(KnownGraphs.TimeDuration),
		{
			mapper: mapDuration
		}
	));
}
