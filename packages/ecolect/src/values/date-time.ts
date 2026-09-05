import { KnownGraphs } from '@ecolect/language';
import { mapDateTime } from '@ecolect/type-datetime';

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
