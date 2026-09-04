import { KnownGraphs } from '@ecolect/language';
import { mapTime } from '@ecolect/type-datetime';

import { LanguageSpecificValue, ParsingValue } from './base.js';

export function timeValue() {
	return new LanguageSpecificValue(language => new ParsingValue(
		language.findGraph(KnownGraphs.Time),
		{
			mapper: mapTime
		}
	));
}
