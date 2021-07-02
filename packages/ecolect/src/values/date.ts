import { KnownGraphs } from '@ecolect/language';
import { mapDate } from '@ecolect/type-datetime';

import { LanguageSpecificValue, ParsingValue } from './base';

export function dateValue() {
	return new LanguageSpecificValue(language => new ParsingValue(
		language.findGraph(KnownGraphs.Date),
		{
			mapper: mapDate
		}
	));
}
