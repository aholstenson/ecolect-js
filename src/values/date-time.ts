import { LanguageSpecificValue, ParsingValue } from './base';

export function dateTime() {
	return new LanguageSpecificValue(language => new ParsingValue(language.getMatcher('date-time')));
}
