import { KnownGraphs } from '../language/index.js';
import { mapDuration } from '../type-datetime/index.js';

import { LanguageSpecificValue, ParsingValue } from './base.js';

export function dateDurationValue() {
	return new LanguageSpecificValue(language => new ParsingValue(
		language.findGraph(KnownGraphs.DateDuration),
		{
			mapper: mapDuration
		}
	));
}
