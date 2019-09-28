import { LanguageSpecificValue, ParsingValue } from './base';

export function dateValue() {
	return new LanguageSpecificValue(language => new ParsingValue(language.getMatcher('date')));
}
