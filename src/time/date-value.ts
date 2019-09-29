import { toDate } from './toDate';
import { Language } from '../language/Language';
import { Period } from './Period';
import { Precision } from './Precision';

export interface DateValue {
	readonly period?: Period;
	readonly precision?: Precision;

	readonly year?: number;
	readonly month?: number;
	readonly day?: number;

	readonly hour?: number;
	readonly minute?: number;
	readonly second?: number;
	readonly millisecond?: number;

	/**
	 * Convert this value into a Date.
	 *
	 * @param now
	 */
	toDate(now?: Date): Date;
}

export class MutableDateValue implements DateValue {
	public period?: Period;
	public precision?: Precision;

	public year?: number;
	public month?: number;
	public day?: number;

	public hour?: number;
	public minute?: number;
	public second?: number;
	public millisecond?: number;

	public toDate(now?: Date): Date {
		return toDate(this, now || new Date());
	}
}
