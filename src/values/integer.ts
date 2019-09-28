import { LanguageSpecificValue, ParsingValue } from './base';

export function integerValue() {
	return new LanguageSpecificValue(language => new ParsingValue(language.getMatcher('integer')));
}
