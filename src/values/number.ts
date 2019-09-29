import { LanguageSpecificValue, ParsingValue } from './base';
import { KnownGraphs } from '../graph/KnownGraphs';
import { mapNumber } from '../numbers/numbers';

export function numberValue() {
	return new LanguageSpecificValue(language => new ParsingValue(
		language.findGraph(KnownGraphs.Number),
		{
			mapper: mapNumber
		}
	));
}
