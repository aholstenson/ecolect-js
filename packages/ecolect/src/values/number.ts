import { KnownGraphs } from '@ecolect/language';
import { mapNumber } from '@ecolect/type-numbers';

import { LanguageSpecificValue, ParsingValue } from './base';

export function numberValue() {
	return new LanguageSpecificValue(language => new ParsingValue(
		language.findGraph(KnownGraphs.Number),
		{
			mapper: mapNumber
		}
	));
}
