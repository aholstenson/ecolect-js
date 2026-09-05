import { booleanRenderer } from '../generation/renderers/booleans.js';
import { KnownGraphs } from '../language/index.js';

import { LanguageSpecificValue, ParsingValue } from './base.js';

export function booleanValue() {
	return new LanguageSpecificValue<boolean>(
		language => new ParsingValue(
			language.findGraph(KnownGraphs.Boolean),
			{
				mapper: o => o
			}
		),
		() => booleanRenderer()
	);
}
