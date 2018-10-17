
/**
 * Resolve the current time from the given encounter.
 */
export default function(encounter) {
	if(encounter.options.now) {
		return encounter.options.now;
	} else {
		return encounter.options.now = new Date();
	}
}
