import type { Encounter } from '../../graph/index.js';
import { GraphBuilder } from '../../graph/index.js';
import type {
	DateTimeData,
	DateTimeOptions,
	DayPart} from '../../type-datetime/index.js';
import {

	combine,
	reverse,
	hasHour,
	hasPmHour,
	isHour,

	time12h,
	time24h,
	toAM,
	toPM,

	asTime,
	plainNumberTime,

	dayPart,
	dayPartOnDay,
	hasOpenHour,
	inDayPart,
	toNight,

	Precision
} from '../../type-datetime/index.js';
import type { LanguageGraphFactory } from '../index.js';

import { integerGraph } from './integerGraph.js';
import { timeDurationGraph } from './timeDurationGraph.js';

function withPrecision(time: DateTimeData, precision: Precision) {
	/*
	 * A word such as `ish` or `sharp` only makes sense next to a time, so it
	 * marks a plain number as one.
	 */
	return combine(asTime(time), {
		precision: precision
	});
}

function adjustMinutes(time: DateTimeData, minutes: number) {
	return combine(time, {
		relativeMinutes: minutes
	});
}

/**
 * Check if the last token that was read is a number with three or more
 * digits. Minutes are never written like that, so `1,000` is not a time.
 *
 * @param encounter -
 *   the encounter that read the tokens
 * @returns
 *   `true` if the last token is a number with three or more digits
 */
function endsWithLongNumber(encounter: Encounter): boolean {
	const token = encounter.tokens[encounter.currentIndex - 1];
	return typeof token !== 'undefined' && /^[0-9]{3,}$/.test(token.raw);
}

/**
 * The words for the named parts of the day.
 */
const DAY_PARTS: Record<string, DayPart> = {
	'morning': 'morning',
	'in the morning': 'morning',

	'lunch': 'lunch',
	'lunchtime': 'lunch',
	'lunch time': 'lunch',

	'afternoon': 'afternoon',
	'in the afternoon': 'afternoon',

	'evening': 'evening',
	'in the evening': 'evening',

	'night': 'night',
	'at night': 'night',

	'start of day': 'startOfDay',
	'start of the day': 'startOfDay',
	'start of business': 'startOfDay',
	'first thing': 'startOfDay',

	'end of day': 'endOfDay',
	'end of the day': 'endOfDay',
	'eod': 'endOfDay',
	'end of business': 'endOfDay',
	'close of business': 'endOfDay',
	'cob': 'endOfDay'
};

/**
 * The words for parts of the current day.
 */
const DAY_PARTS_TODAY: Record<string, DayPart> = {
	'this morning': 'morning',
	'this afternoon': 'afternoon',
	'this evening': 'evening',
	'tonight': 'evening'
};

/**
 * The words for parts of the day that can have an hour after them.
 */
const DAY_PARTS_BEFORE_HOUR: Record<string, DayPart> = {
	'morning': 'morning',
	'afternoon': 'afternoon',
	'evening': 'evening',
	'night': 'night'
};

export const timeGraph: LanguageGraphFactory<DateTimeData> = {
	id: 'time',

	create(language) {
		const integer = language.graph(integerGraph);
		const timeDuration = language.graph(timeDurationGraph);

		const relativeMinutes = new GraphBuilder<number>(language)
			.name('relativeMinutes')

			.add([ GraphBuilder.result(integer, v => v.value >= 1 && v.value <= 3), 'quarters' ], v => v[0].value * 15)
			.add('quarter', 15)
			.add('half', 30)
			.add(integer, v => v[0].value)
			.add([ integer, 'minutes' ], v => v[0].value)

			.build();

		const builder = new GraphBuilder<DateTimeData>(language)
			.name('time')

			.skipPunctuation();

		// Named parts of the day, such as morning and lunch
		for(const [ words, part ] of Object.entries(DAY_PARTS)) {
			builder.add(words, (v, options: DateTimeOptions) => dayPart(part, options));
		}

		/*
		 * Parts of the current day, which stay on that day when they have
		 * passed. An hour next to the part is in that part of the day, such as
		 * tonight at 8.
		 */
		for(const [ words, part ] of Object.entries(DAY_PARTS_TODAY)) {
			builder
				.add(words, (v, options: DateTimeOptions) => dayPartOnDay(part, 0, options))
				.add([ words, GraphBuilder.result(hasOpenHour) ], v => ({ ...inDayPart(v[0], part), relativeDays: 0 }))
				.add([ GraphBuilder.result(hasOpenHour), words ], v => ({ ...inDayPart(v[0], part), relativeDays: 0 }));
		}

		// An hour after a part of the day, such as night at 11
		for(const [ words, part ] of Object.entries(DAY_PARTS_BEFORE_HOUR)) {
			builder.add([ words, GraphBuilder.result(hasOpenHour) ], v => inDayPart(v[0], part));
		}

		return builder
			.add('last night', (v, options: DateTimeOptions) => dayPartOnDay('night', -1, options))

			// An hour before or after lunch
			.add('after lunch', (v, options: DateTimeOptions) => dayPart('lunch', options, 1))
			.add('before lunch', (v, options: DateTimeOptions) => dayPart('lunch', options, -1))

			// Approximate times
			.add([ GraphBuilder.result(), 'ish' ], v => withPrecision(v[0], Precision.Approximate))
			.add([ GraphBuilder.result(), 'approximately' ], v => withPrecision(v[0], Precision.Approximate))
			.add([ 'about', GraphBuilder.result() ], v => withPrecision(v[0], Precision.Approximate))
			.add([ 'around', GraphBuilder.result() ], v => withPrecision(v[0], Precision.Approximate))
			.add([ 'approximately', GraphBuilder.result() ], v => withPrecision(v[0], Precision.Approximate))

			.add([ GraphBuilder.result(), 'amish' ], v => combine(toAM(v[0]), { precision: Precision.Approximate }))
			.add([ GraphBuilder.result(hasPmHour), 'pmish' ], v => combine(toPM(v[0]), { precision: Precision.Approximate }))

			// Exact times
			.add([ 'exactly', GraphBuilder.result() ], v => withPrecision(v[0], Precision.Exact))
			.add([ GraphBuilder.result(), 'exactly' ], v => withPrecision(v[0], Precision.Exact))
			.add([ GraphBuilder.result(), 'sharp' ], v => withPrecision(v[0], Precision.Exact))

			// Named times
			.map(
				{
					'midnight': 0,
					'noon': 12
				},
				v => time24h(v)
			)

			// An hour in a part of the day, such as 9 in the morning
			.add([ GraphBuilder.result(hasHour), 'in the morning' ], v => toAM(v[0]))
			.add([ GraphBuilder.result(hasPmHour), 'in the afternoon' ], v => toPM(v[0]))
			.add([ GraphBuilder.result(hasPmHour), 'in the evening' ], v => toPM(v[0]))
			.add([ GraphBuilder.result(hasHour), 'at night' ], v => toNight(v[0]))

			// HH, such as 4, 14
			.add(/^[0-9]{1,2}$/, v => plainNumberTime(time12h(parseInt(v[0], 10))))
			.add([ integer ], v => plainNumberTime(time12h(v[0].value)))

			// HH:MM, such as 00:10, 9:30, 14 00
			.add([ /^[0-9]{1,2}$/, ':', /^[0-9]{1,2}$/ ], v => {
				return time12h(parseInt(v[0], 10), parseInt(v[1], 10));
			})
			.add([ integer, ':', integer ], (v, options, encounter) => endsWithLongNumber(encounter)
				? null
				: time12h(v[0].value, v[1].value))

			/*
			 * HH.MM, such as 12.30 and 9.15, which British English writes.
			 * The minutes must have two digits, so that 1.5 is not 01:05.
			 */
			.add([ /^[0-9]{1,2}$/, '.', /^[0-9]{2}$/ ], v => {
				return time12h(parseInt(v[0], 10), parseInt(v[1], 10));
			})
			.add(/^[0-9]{3,4}$/, v => {
				const t = v[0];
				const h = t.length === 3 ? t.substring(0, 1) : t.substring(0, 2);
				const m = t.substring(t.length-2);
				return plainNumberTime(time12h(parseInt(h, 10), parseInt(m, 10)));
			})

			// HH:MM:SS
			.add([ /^[0-9]{1,2}$/, ':', /^[0-9]{1,2}$/, ':', /^[0-9]{1,2}$/ ], v => {
				return time12h(parseInt(v[0], 10), parseInt(v[1], 10), parseInt(v[2], 10));
			})

			.add([ GraphBuilder.result(hasPmHour), 'pm' ], v => toPM(v[0]))
			.add([ GraphBuilder.result(hasPmHour), 'p.m.' ], v => toPM(v[0]))
			.add([ GraphBuilder.result(hasHour), 'am' ], v => toAM(v[0]))
			.add([ GraphBuilder.result(hasHour), 'a.m.' ], v => toAM(v[0]))


			.add([ relativeMinutes, 'to', GraphBuilder.result(isHour) ], v => adjustMinutes(v[1], - v[0]))
			.add([ relativeMinutes, 'til', GraphBuilder.result(isHour) ], v => adjustMinutes(v[1], - v[0]))
			.add([ relativeMinutes, 'before', GraphBuilder.result(isHour) ], v => adjustMinutes(v[1], - v[0]))
			.add([ relativeMinutes, 'of', GraphBuilder.result(isHour) ], v => adjustMinutes(v[1], - v[0]))

			.add([ relativeMinutes, 'past', GraphBuilder.result(isHour) ], v => adjustMinutes(v[1], v[0]))
			.add([ relativeMinutes, 'after', GraphBuilder.result(isHour) ], v => adjustMinutes(v[1], v[0]))
			.add([ 'half', GraphBuilder.result(isHour) ], v => adjustMinutes(v[0], 30))

			// Qualifiers
			.add([ 'in', timeDuration ], v => v[0])
			.add([ timeDuration ], v => v[0])
			.add([ timeDuration, 'ago' ], v => reverse(v[0]))
			.add([ 'at', GraphBuilder.result() ], v => asTime(v[0]))

			.build();
	}
};
