import { DateTimeData } from './DateTimeData';
import { DateTimeEncounter } from './DateTimeEncounter';

import { mapDate } from './dates';
import { mapTime } from './times';
import { LocalDateTime } from 'datetime-types';

export function mapDateTime(r: DateTimeData, e: DateTimeEncounter) {
	const date = mapDate(r, e);

	// If the date doesn't map, skip time mapping
	if(! date) return null;

	const time = mapTime(r, e, { now: date.toDateAtMidnight() });

	return LocalDateTime.fromDateAndTime(date, time);
}
