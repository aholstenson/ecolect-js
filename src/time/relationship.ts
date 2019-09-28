/**
 * Relationship between a described time and the current time.
 */
export const enum TimeRelationship {
	/**
	 * Automatically try to determine the relationship the data has to the
	 * current time.
	 */
	Auto = 'auto',

	/**
	 *
	 */
	CurrentPeriod = 'current-period',

	/**
	 * Assume the time being described is in the future.
	 */
	Future = 'future',

	/**
	 * Assume the time being described is in the past.
	 */
	Past = 'past'
}
