import { DateTimeData } from '@ecolect/type-datetime';
import { NumberData, OrdinalData } from '@ecolect/type-numbers';

/**
 * Graphs that are known to be available for a language. This enum used when
 * fetching a graph from a language and to lookup the type the graph uses.
 *
 * This allows for type-safety within the values.
 */
export enum KnownGraphs {
	Boolean = 'boolean',
	DateDuration = 'date-duration',
	Date = 'date',
	DateInterval = 'date-interval',
	DateTimeDuration = 'date-time-duration',
	DateTime = 'date-time',
	Integer = 'integer',
	Month = 'month',
	Number = 'number',
	Ordinal = 'ordinal',
	Quarter = 'quarter',
	TimeDuration = 'time-duration',
	Time = 'time',
	Week = 'week',
	Year = 'year'
}

/**
 * Types for `KnownGraphs`.
 */
export interface KnownGraphsDataTypes {
	[KnownGraphs.Boolean]: boolean;
	[KnownGraphs.DateDuration]: DateTimeData;
	[KnownGraphs.Date]: DateTimeData;
	[KnownGraphs.DateInterval]: DateTimeData;
	[KnownGraphs.DateTimeDuration]: DateTimeData;
	[KnownGraphs.DateTime]: DateTimeData;
	[KnownGraphs.Integer]: NumberData;
	[KnownGraphs.Month]: DateTimeData;
	[KnownGraphs.Number]: NumberData;
	[KnownGraphs.Ordinal]: OrdinalData;
	[KnownGraphs.Quarter]: DateTimeData;
	[KnownGraphs.TimeDuration]: DateTimeData;
	[KnownGraphs.Time]: DateTimeData;
	[KnownGraphs.Week]: DateTimeData;
	[KnownGraphs.Year]: DateTimeData;
}
