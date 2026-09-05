import { DateInterval, LocalDate, LocalDateTime, LocalTime } from 'datetime-types';

import { KnownGraphs, Language } from '../../language/index.js';
import { DateTimeData, IntervalData, mapDateInterval } from '../../type-datetime/index.js';
import { connectorsFrom, prefixesFrom } from '../connectors.js';
import { invertGraph, textsFor } from '../invertGraph.js';
import { RenderContext, renderer, ValueRenderer } from '../ValueRenderer.js';

/**
 * Write a date as `2010-02-22`, which every language reads the same way.
 *
 * @param date -
 *   the date to write
 * @returns
 *   the date as text
 */
export function isoDate(date: LocalDate): string {
	return pad(date.year, 4) + '-' + pad(date.month, 2) + '-' + pad(date.dayOfMonth, 2);
}

/**
 * Write a time as `14:00`, or as `14:00:30` when it names a second.
 *
 * @param time -
 *   the time to write
 * @returns
 *   the time as text
 */
export function isoTime(time: { hour: number; minute: number; second: number }): string {
	const base = pad(time.hour, 2) + ':' + pad(time.minute, 2);

	return time.second ? base + ':' + pad(time.second, 2) : base;
}

/**
 * Write dates.
 *
 * @returns
 *   renderer for dates
 */
export function dateRenderer(): ValueRenderer<LocalDate> {
	return renderer(value => [ isoDate(value) ]);
}

/**
 * Write times of day.
 *
 * @returns
 *   renderer for times
 */
export function timeRenderer(): ValueRenderer<LocalTime> {
	return renderer(value => [ isoTime(value) ]);
}

/**
 * Write dates with a time of day.
 *
 * @returns
 *   renderer for dates with a time
 */
export function dateTimeRenderer(): ValueRenderer<LocalDateTime> {
	return renderer(value => {
		const date = isoDate(value as unknown as LocalDate);
		const time = isoTime(value);

		return [
			date + ' ' + time,
			time + ' ' + date
		];
	});
}

/**
 * Write intervals between dates. A whole year is written as `2025` and a
 * whole month as `january 2025`, as those are the shortest ways to say them.
 * Anything else is written as a range between two dates, using the words the
 * language has for joining them.
 *
 * @returns
 *   renderer for date intervals
 */
export function dateIntervalRenderer(): ValueRenderer<DateInterval> {
	return renderer((value, context) => {
		const result: string[] = [];
		const start = value.start;
		const end = value.end;

		if(start && end) {
			if(isWholeYear(start, end)) {
				result.push(String(start.year));
			}

			if(isWholeMonth(start, end)) {
				for(const month of monthTexts(context.language, start.month)) {
					result.push(month + ' ' + start.year);
				}
			}

			if(start.equals(end)) {
				result.push(isoDate(start));
			}

			for(const connector of connectors(context.language)) {
				result.push(isoDate(start) + ' ' + connector + ' ' + isoDate(end));
			}
		} else if(start || end) {
			const date = isoDate((start ?? end) as LocalDate);
			for(const prefix of prefixes(context.language)) {
				result.push(prefix + ' ' + date);
			}
		}

		/*
		 * Intervals the language names on its own, such as `any time`. These
		 * are checked here instead of being guessed at, so only the ones that
		 * mean this interval are offered.
		 */
		result.push(...namedIntervals(value, context));

		return result;
	});
}

/**
 * Get if an interval covers a whole year.
 *
 * @param start -
 *   the first date of the interval
 * @param end -
 *   the last date of the interval
 * @returns
 *   `true` if the interval is a whole year
 */
function isWholeYear(start: LocalDate, end: LocalDate): boolean {
	return start.year === end.year
		&& start.month === 1 && start.dayOfMonth === 1
		&& end.month === 12 && end.dayOfMonth === 31;
}

/**
 * Get if an interval covers a whole month.
 *
 * @param start -
 *   the first date of the interval
 * @param end -
 *   the last date of the interval
 * @returns
 *   `true` if the interval is a whole month
 */
function isWholeMonth(start: LocalDate, end: LocalDate): boolean {
	return start.year === end.year && start.month === end.month
		&& start.dayOfMonth === 1
		&& end.dayOfMonth === daysInMonth(start.year, start.month);
}

/**
 * Get the number of days in a month.
 *
 * @param year -
 *   the year the month is in
 * @param month -
 *   the month, where January is 1
 * @returns
 *   the number of days
 */
function daysInMonth(year: number, month: number): number {
	return new Date(year, month, 0).getDate();
}

/**
 * Get the names a language has for a month, longest name first.
 *
 * @param language -
 *   the language to read
 * @param month -
 *   the month, where January is 1
 * @returns
 *   the names of the month
 */
function monthTexts(language: Language, month: number): string[] {
	const graph = language.findGraph(KnownGraphs.Month);

	/*
	 * Months are counted from zero within the data of a match, and only the
	 * entries that name nothing but a month are names of a month.
	 */
	return textsFor<DateTimeData>(graph, data => {
		return data.month === month - 1 && Object.keys(data).length === 1;
	}).sort((a, b) => b.length - a.length);
}

/**
 * Get the words a language uses to join the two dates of a range.
 *
 * @param language -
 *   the language to read
 * @returns
 *   the words
 */
function connectors(language: Language): string[] {
	return connectorsFrom(language.findGraph(KnownGraphs.DateInterval));
}

/**
 * Get the words a language writes before a date to describe an interval with
 * only one end, such as `before`.
 *
 * @param language -
 *   the language to read
 * @returns
 *   the words
 */
function prefixes(language: Language): string[] {
	return prefixesFrom(language.findGraph(KnownGraphs.DateInterval));
}

/**
 * Get the texts a language has for an interval it names on its own.
 *
 * @param value -
 *   the interval to write
 * @param context -
 *   what is known about the text being written
 * @returns
 *   the texts that mean the interval
 */
function namedIntervals(value: DateInterval, context: RenderContext): string[] {
	const graph = context.language.findGraph(KnownGraphs.DateInterval);
	const result: string[] = [];

	for(const entry of invertGraph<IntervalData>(graph)) {
		let mapped;
		try {
			mapped = mapDateInterval(entry.value, context.options);
		} catch {
			continue;
		}

		if(mapped && mapped.equals(value)) {
			result.push(entry.text);
		}
	}

	return result;
}

/**
 * Write a number with leading zeroes.
 *
 * @param value -
 *   the number to write
 * @param length -
 *   the number of digits to write
 * @returns
 *   the number as text
 */
function pad(value: number, length: number): string {
	return String(value).padStart(length, '0');
}
