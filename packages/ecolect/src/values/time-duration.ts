import { KnownGraphs } from '@ecolect/language';
import { mapDuration } from '@ecolect/type-datetime';

import { LanguageSpecificValue, ParsingValue } from './base';

export function timeDurationValue() {
	return new LanguageSpecificValue(language => new ParsingValue(
		language.findGraph(KnownGraphs.TimeDuration),
		{
			mapper: mapDuration
		}
	));
}
