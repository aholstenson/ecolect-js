import { LanguageSpecificValue, ParsingValue } from './base';

export function timeValue() {
	return new LanguageSpecificValue(language => new ParsingValue(language.getMatcher('time')));
}
