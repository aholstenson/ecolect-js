import { LanguageSpecificValue, ParsingValue } from './base';
import { KnownGraphs } from '../graph/KnownGraphs';
import { mapNumber } from '../numbers/numbers';

export function integerValue() {
	return new LanguageSpecificValue(language => new ParsingValue(
		language.findGraph(KnownGraphs.Integer),
		{
			mapper: mapNumber
		}
	));
}
