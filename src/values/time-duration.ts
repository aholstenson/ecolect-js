import { LanguageSpecificValue, ParsingValue } from './base';

export function timeDurationValue() {
	return new LanguageSpecificValue(language => new ParsingValue(language.getMatcher('time-duration')));
}
