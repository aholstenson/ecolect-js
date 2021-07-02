import { KnownGraphs } from '@ecolect/language';
import { mapDateTime } from '@ecolect/type-datetime';

import { LanguageSpecificValue, ParsingValue } from './base';

export function dateTime() {
	return new LanguageSpecificValue(language => new ParsingValue(
		language.findGraph(KnownGraphs.DateTime),
		{
			mapper: mapDateTime
		}
	));
}
