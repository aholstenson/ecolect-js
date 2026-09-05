import { KnownGraphs } from '../../language/index.js';
import { DateTimeData, Duration, mapDuration } from '../../type-datetime/index.js';
import { invertGraph } from '../invertGraph.js';
import { patternsFrom } from '../patterns.js';
import { renderer, ValueRenderer } from '../ValueRenderer.js';

/**
 * The graphs that read a length of time.
 */
export type DurationGraph =
	KnownGraphs.DateDuration
	| KnownGraphs.TimeDuration
	| KnownGraphs.DateTimeDuration;

/**
 * The parts a length of time is made up of.
 */
const PARTS: (keyof Duration)[] = [
	'years', 'quarters', 'weeks', 'months',
	'days', 'hours', 'minutes', 'seconds', 'milliseconds'
];

/**
 * The graphs a kind of length of time is written from. A length of time that
 * covers both dates and times is made up of the two, and reads everything
 * they read, so the words of both are used.
 */
const SOURCES: Record<DurationGraph, DurationGraph[]> = {
	[KnownGraphs.DateDuration]: [ KnownGraphs.DateDuration ],
	[KnownGraphs.TimeDuration]: [ KnownGraphs.TimeDuration ],
	[KnownGraphs.DateTimeDuration]: [
		KnownGraphs.DateTimeDuration,
		KnownGraphs.DateDuration,
		KnownGraphs.TimeDuration
	]
};

/**
 * Write a length of time, such as `7 days`. The words for the parts of a
 * length of time are read out of the graph of the language, so `7 dagar` is
 * written for Swedish without the words being listed here.
 *
 * A length of time that names more than one part, such as two days and three
 * hours, is not written, as the graph does not say how the parts are joined.
 *
 * @param graph -
 *   the graph that reads this kind of length of time
 * @returns
 *   renderer for lengths of time
 */
export function durationRenderer(graph: DurationGraph): ValueRenderer<Duration> {
	return renderer((value, context) => {
		const result: string[] = [];

		const add = (text: string) => {
			if(text !== '' && ! result.includes(text)) {
				result.push(text);
			}
		};

		for(const source of SOURCES[graph]) {
			const durations = context.language.findGraph(source);

			// Lengths of time the language names on its own, such as `a week`
			for(const entry of invertGraph<DateTimeData>(durations)) {
				if(sameDuration(mapDuration(entry.value), value)) {
					add(entry.text);
				}
			}

			/*
			 * Lengths of time written as an amount followed by what is being
			 * counted. The amount is offered to the graph, which says what
			 * the words around it would mean.
			 */
			for(const amount of amounts(value)) {
				for(const pattern of patternsFrom<DateTimeData>(durations)) {
					const data = pattern.resolve({ value: amount, rawDigits: String(amount) });
					if(! data || ! sameDuration(mapDuration(data), value)) continue;

					add([ pattern.before, String(amount), pattern.after ]
						.filter(part => part !== '')
						.join(' '));
				}
			}
		}

		return result;
	});
}

/**
 * Get the amounts a length of time names, such as the `7` in seven days.
 *
 * @param value -
 *   the length of time
 * @returns
 *   the amounts, without repeats
 */
function amounts(value: Duration): number[] {
	const result: number[] = [];

	for(const part of PARTS) {
		const amount = value[part];
		if(typeof amount === 'number' && ! result.includes(amount)) {
			result.push(amount);
		}
	}

	return result;
}

/**
 * Get if two lengths of time are the same. A part that is not named is the
 * same as a part that is named as nothing.
 *
 * @param a -
 *   the first length of time
 * @param b -
 *   the second length of time
 * @returns
 *   `true` if they are the same length of time
 */
function sameDuration(a: Duration, b: Duration): boolean {
	for(const part of PARTS) {
		if((a[part] ?? null) !== (b[part] ?? null)) return false;
	}

	return true;
}
