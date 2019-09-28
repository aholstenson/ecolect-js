/**
 * Enum used to indicate at what edge of an interval something is located.
 * When set on a `DateTimeData` this will adjust the time towards the end of
 * the period of time being described.
 *
 * If the largest period of time is `Period.Day` a value of `Start` would
 * adjust the hour, minutes, seconds and millisecond of the day to be the
 * start of day (usually midnight) and `End` would adjust it to be the end
 * (usually a millisecond before midnight). The actual adjustment takes into
 * account things as daylight savings and leap seconds so the exact times will
 * vary depending on the date.
 */
export const enum IntervalEdge {
	Start = 'start',

	End = 'end'
}
