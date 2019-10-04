import { LanguageSpecificValue, ParsingValue } from './base';
import { KnownGraphs } from '../graph/KnownGraphs';
import { mapInteger } from '../numbers/numbers';

export function integerValue() {
	return new LanguageSpecificValue(language => new ParsingValue(
		language.findGraph(KnownGraphs.Integer),
		{
			mapper: mapInteger
		}
	));
}
