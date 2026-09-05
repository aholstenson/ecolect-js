import { durationRenderer } from '../generation/renderers/durations.js';
import { KnownGraphs } from '../language/index.js';
import { mapDuration } from '../type-datetime/index.js';

import { LanguageSpecificValue, ParsingValue } from './base.js';

export function timeDurationValue() {
	return new LanguageSpecificValue(
		language => new ParsingValue(
			language.findGraph(KnownGraphs.TimeDuration),
			{
				mapper: mapDuration
			}
		),
		() => durationRenderer(KnownGraphs.TimeDuration)
	);
}
