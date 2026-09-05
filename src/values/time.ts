import { timeRenderer } from '../generation/renderers/dates.js';
import { KnownGraphs } from '../language/index.js';
import { mapTime } from '../type-datetime/index.js';

import { LanguageSpecificValue, ParsingValue } from './base.js';

export function timeValue() {
	return new LanguageSpecificValue(
		language => new ParsingValue(
			language.findGraph(KnownGraphs.Time),
			{
				mapper: mapTime
			}
		),
		() => timeRenderer()
	);
}
