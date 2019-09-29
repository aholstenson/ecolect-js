import { LanguageSpecificValue, ParsingValue } from './base';
import { KnownGraphs } from '../graph/KnownGraphs';
import { mapDate } from '../time/dates';

export function dateValue() {
	return new LanguageSpecificValue(language => new ParsingValue(
		language.findGraph(KnownGraphs.Date),
		{
			mapper: mapDate
		}
	));
}
