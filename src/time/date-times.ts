import { DateTimeData } from './DateTimeData';
import { DateTimeEncounter } from './DateTimeEncounter';

import { mapDate } from './dates';
import { mapTime } from './times';

export function mapDateTime(r: DateTimeData, e: DateTimeEncounter) {
	const result = mapDate(r, e);

	// If the date doesn't map, skip time mapping
	if(! result) return null;

	return mapTime(r, e, { now: result.toDate() }, result);
}
