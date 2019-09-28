import { LanguageSpecificValue, ParsingValue } from './base';

export function booleanValue() {
	return new LanguageSpecificValue(language => new ParsingValue(language.getMatcher('boolean')));
}
