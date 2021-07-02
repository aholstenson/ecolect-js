import { KnownGraphs } from '@ecolect/language';

import { LanguageSpecificValue, ParsingValue } from './base';

export function booleanValue() {
	return new LanguageSpecificValue<boolean>(language => new ParsingValue(
		language.findGraph(KnownGraphs.Boolean),
		{
			mapper: o => o
		}
	));
}
