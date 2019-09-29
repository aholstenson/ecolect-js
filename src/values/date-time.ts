import { LanguageSpecificValue, ParsingValue } from './base';
import { KnownGraphs } from '../graph/KnownGraphs';
import { mapDateTime } from '../time/date-times';

export function dateTime() {
	return new LanguageSpecificValue(language => new ParsingValue(
		language.findGraph(KnownGraphs.DateTime),
		{
			mapper: mapDateTime
		}
	));
}
