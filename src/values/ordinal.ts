import { LanguageSpecificValue, ParsingValue } from './base';

export function ordinalValue() {
	return new LanguageSpecificValue(language => new ParsingValue(language.getMatcher('ordinal')));
}
