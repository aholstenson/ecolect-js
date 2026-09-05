import { dateRenderer } from '../generation/renderers/dates.js';
import { KnownGraphs } from '../language/index.js';
import { mapDate } from '../type-datetime/index.js';

import { LanguageSpecificValue, ParsingValue } from './base.js';

export function dateValue() {
	return new LanguageSpecificValue(
		language => new ParsingValue(
			language.findGraph(KnownGraphs.Date),
			{
				mapper: mapDate
			}
		),
		() => dateRenderer()
	);
}
