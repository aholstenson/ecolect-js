import { KnownGraphs } from '../language/index.js';
import { mapDateTime } from '../type-datetime/index.js';

import { LanguageSpecificValue, ParsingValue } from './base.js';

export function dateTimeValue() {
	return new LanguageSpecificValue(language => new ParsingValue(
		language.findGraph(KnownGraphs.DateTime),
		{
			mapper: mapDateTime
		}
	));
}

/**
 * Create a value that matches a date and time.
 *
 * @deprecated Use {@link dateTimeValue} instead, which follows the naming of
 * the other values.
 */
export const dateTime = dateTimeValue;
