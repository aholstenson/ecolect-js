/**
 * Order of the fields in a numeric date such as `1/2/2017` or `1/2/17`.
 * The order is a property of the locale of the person writing the date, not
 * of the language, so it is given as an option when matching.
 */
export enum DateOrder {
	/**
	 * Month, day and then year. Used in the United States, so `1/2/2017` is
	 * January 2nd.
	 */
	MonthDayYear = 'month-day-year',

	/**
	 * Day, month and then year. Used in most of Europe, Latin America, Africa
	 * and Oceania, so `1/2/2017` is February 1st.
	 */
	DayMonthYear = 'day-month-year',

	/**
	 * Year, month and then day. Used in East Asia and in ISO 8601, so
	 * `17/1/2` is January 2nd 2017. A date with the year last reads month
	 * before day.
	 */
	YearMonthDay = 'year-month-day'
}
