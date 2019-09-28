import { LanguageSpecificValue, ParsingValue } from './base';

export function numberValue() {
	return new LanguageSpecificValue(language => new ParsingValue(language.getMatcher('number')));
}
