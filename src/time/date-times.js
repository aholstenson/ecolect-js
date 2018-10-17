import { map as mapDate } from './dates';
import { map as mapTime } from './times';

export function map(r, e) {
	const result = mapDate(r, e);

	return mapTime(r, e, result.toDate(), result);
}
