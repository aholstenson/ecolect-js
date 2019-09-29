import { DateTimeOptions } from './DateTimeOptions';

/**
 * Interface that defines a time encounter as something that has date and
 * time options. This is used internally in the date time handling so that
 * the main encounter doesn't have to be imported, which simplifies things
 * such as testing.
 */
export interface DateTimeEncounter {
	options: DateTimeOptions;
}
