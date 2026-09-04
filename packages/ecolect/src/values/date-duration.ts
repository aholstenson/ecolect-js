import { KnownGraphs } from '@ecolect/language';
import { mapDuration } from '@ecolect/type-datetime';

import { LanguageSpecificValue, ParsingValue } from './base.js';

export function dateDurationValue() {
	return new LanguageSpecificValue(language => new ParsingValue(
		language.findGraph(KnownGraphs.DateDuration),
		{
			mapper: mapDuration
		}
	));
}
