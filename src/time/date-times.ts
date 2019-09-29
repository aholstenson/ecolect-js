import { DateTimeData } from './DateTimeData';
import { DateTimeEncounter } from './DateTimeEncounter';

import { map as mapDate } from './dates';
import { map as mapTime } from './times';

export function map(r: DateTimeData, e: DateTimeEncounter) {
	const result = mapDate(r, e);

	// If the date doesn't map, skip time mapping
	if(! result) return null;

	return mapTime(r, e, { now: result.toDate() }, result);
}
