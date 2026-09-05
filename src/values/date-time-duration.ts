import { KnownGraphs } from '../language/index.js';
import { mapDuration } from '../type-datetime/index.js';

import { LanguageSpecificValue, ParsingValue } from './base.js';

export function dateTimeDurationValue() {
	return new LanguageSpecificValue(language => new ParsingValue(
		language.findGraph(KnownGraphs.DateTimeDuration),
		{
			mapper: mapDuration
		}
	));
}
