import { KnownGraphs } from '../language/index.js';
import { mapInteger } from '../type-numbers/index.js';

import { LanguageSpecificValue, ParsingValue } from './base.js';

export function integerValue() {
	return new LanguageSpecificValue(language => new ParsingValue(
		language.findGraph(KnownGraphs.Integer),
		{
			mapper: mapInteger
		}
	));
}
