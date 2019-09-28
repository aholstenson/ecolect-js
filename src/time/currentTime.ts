import { DateTimeOptions } from './options';

/**
 * Resolve the current time from the given options. This is used so that the
 * time can be set to the current time if needed.
 */
export function currentTime(options: DateTimeOptions) {
	if(options.now) {
		return options.now;
	} else {
		return options.now = new Date();
	}
}
