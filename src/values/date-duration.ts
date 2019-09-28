import { LanguageSpecificValue, ParsingValue } from './base';

export function dateDurationValue() {
	return new LanguageSpecificValue(language => new ParsingValue(language.getMatcher('date-duration')));
}
