import { numberRenderer } from '../generation/renderers/numbers.js';
import { KnownGraphs } from '../language/index.js';
import { mapNumber } from '../type-numbers/index.js';

import { LanguageSpecificValue, ParsingValue } from './base.js';

export function numberValue() {
	return new LanguageSpecificValue(
		language => new ParsingValue(
			language.findGraph(KnownGraphs.Number),
			{
				mapper: mapNumber
			}
		),
		() => numberRenderer()
	);
}
