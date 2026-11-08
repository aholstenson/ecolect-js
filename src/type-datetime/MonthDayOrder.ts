/**
 * The order of the month and the day in a numeric date, such as `1/2` or
 * `1/2/2017`. This is the same as the order in `DateOrder` for most locales,
 * but not for all. Swedish writes a full date with the year first, as in
 * `2017-01-02`, but a date without a year with the day first, as in `2/1`.
 */
export enum MonthDayOrder {
	/**
	 * Month and then day, so `1/2` is January 2nd.
	 */
	MonthDay = 'month-day',

	/**
	 * Day and then month, so `1/2` is February 1st.
	 */
	DayMonth = 'day-month'
}
