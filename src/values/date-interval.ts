import { LanguageSpecificValue, ParsingValue } from './base';

export function dateIntervalValue() {
	return new LanguageSpecificValue(language => new ParsingValue(language.getMatcher('date-interval')));
}
