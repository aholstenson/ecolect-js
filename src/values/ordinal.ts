import { LanguageSpecificValue, ParsingValue } from './base';
import { KnownGraphs } from '../graph/KnownGraphs';
import { mapOrdinal } from '../numbers/ordinals';

export function ordinalValue() {
	return new LanguageSpecificValue(language => new ParsingValue(
		language.findGraph(KnownGraphs.Ordinal),
		{
			mapper: mapOrdinal
		}
	));
}
