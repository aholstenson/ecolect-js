import { KnownGraphs } from '@ecolect/language';
import { mapDuration } from '@ecolect/type-datetime';

import { LanguageSpecificValue, ParsingValue } from './base.js';

export function dateTimeDurationValue() {
	return new LanguageSpecificValue(language => new ParsingValue(
		language.findGraph(KnownGraphs.DateTimeDuration),
		{
			mapper: mapDuration
		}
	));
}
