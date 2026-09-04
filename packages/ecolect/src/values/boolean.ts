import { KnownGraphs } from '@ecolect/language';

import { LanguageSpecificValue, ParsingValue } from './base.js';

export function booleanValue() {
	return new LanguageSpecificValue<boolean>(language => new ParsingValue(
		language.findGraph(KnownGraphs.Boolean),
		{
			mapper: o => o
		}
	));
}
