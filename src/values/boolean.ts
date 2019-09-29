import { LanguageSpecificValue, ParsingValue } from './base';
import { KnownGraphs } from '../graph/KnownGraphs';

export function booleanValue() {
	return new LanguageSpecificValue<boolean, boolean>(language => new ParsingValue(
		language.findGraph(KnownGraphs.Boolean),
		{
			mapper: o => o
		}
	));
}
