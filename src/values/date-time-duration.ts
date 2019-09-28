import { LanguageSpecificValue, ParsingValue } from './base';

export function dateTimeDurationValue() {
	return new LanguageSpecificValue(language => new ParsingValue(language.getMatcher('date-time-duration')));
}
