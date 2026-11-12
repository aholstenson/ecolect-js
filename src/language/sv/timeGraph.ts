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
 * The words for the named parts of the day.
 */
const DAY_PARTS: Record<string, DayPart> = {
	'morgon': 'morning',
	'morgonen': 'morning',
	'på morgonen': 'morning',
	'bitti': 'morning',
	'förmiddag': 'morning',
	'förmiddagen': 'morning',
	'på förmiddagen': 'morning',

	'lunch': 'lunch',
	'lunchen': 'lunch',
	'lunchtid': 'lunch',

	'eftermiddag': 'afternoon',
	'eftermiddagen': 'afternoon',
	'på eftermiddagen': 'afternoon',

	'kväll': 'evening',
	'kvällen': 'evening',
	'på kvällen': 'evening',

	'natt': 'night',
	'natten': 'night',
	'på natten': 'night',

	'början av dagen': 'startOfDay',
	'dagens början': 'startOfDay',
	'arbetsdagens början': 'startOfDay',

	'slutet av dagen': 'endOfDay',
	'dagens slut': 'endOfDay',
	'arbetsdagens slut': 'endOfDay',
	'slutet av arbetsdagen': 'endOfDay'
};

/**
 * The words for parts of the current day. `i morse` and `i förmiddags` are
 * the morning that has passed.
 */
const DAY_PARTS_TODAY: Record<string, DayPart> = {
	'i morse': 'morning',
	'i förmiddags': 'morning',
	'i förmiddag': 'morning',
	'i eftermiddag': 'afternoon',
	'i eftermiddags': 'afternoon',
	'ikväll': 'evening',
	'i kväll': 'evening',
	'inatt': 'night',
	'i natt': 'night'
};

/**
 * The words for parts of the day that can have an hour after them.
 */
const DAY_PARTS_BEFORE_HOUR: Record<string, DayPart> = {
	'morgon': 'morning',
	'bitti': 'morning',
	'förmiddag': 'morning',
	'eftermiddag': 'afternoon',
	'kväll': 'evening',
	'natt': 'night'
};

export const timeGraph: LanguageGraphFactory<DateTimeData> = {
	id: 'time',

	create(language) {
		const integer = language.graph(integerGraph);
		const timeDuration = language.graph(timeDurationGraph);

		const relativeMinutes = new GraphBuilder<number>(language)
			.name('relativeMinutes')

			.add([ GraphBuilder.result(integer, v => v.value >= 1 && v.value <= 3), 'kvart' ], v => v[0].value * 15)
			.add('kvart', 15)
			.add('halv', 30)
			.add(integer, v => v[0].value)
			.add([ integer, 'minuter' ], v => v[0].value)
			.add([ integer, 'min' ], v => v[0].value)

			.build();

		const builder = new GraphBuilder<DateTimeData>(language)
			.name('time')

			.skipPunctuation();

		// Named parts of the day, such as morgon and lunch
		for(const [ words, part ] of Object.entries(DAY_PARTS)) {
			builder.add(words, (v, options: DateTimeOptions) => dayPart(part, options));
		}

		/*
		 * Parts of the current day, which stay on that day when they have
		 * passed. An hour next to the part is in that part of the day, such as
		 * ikväll kl 8.
		 */
		for(const [ words, part ] of Object.entries(DAY_PARTS_TODAY)) {
			builder
				.add(words, (v, options: DateTimeOptions) => dayPartOnDay(part, 0, options))
				.add([ words, GraphBuilder.result(hasOpenHour) ], v => ({ ...inDayPart(v[0], part), relativeDays: 0 }))
				.add([ GraphBuilder.result(hasOpenHour), words ], v => ({ ...inDayPart(v[0], part), relativeDays: 0 }));
		}

		// An hour after a part of the day, such as kväll kl 8
		for(const [ words, part ] of Object.entries(DAY_PARTS_BEFORE_HOUR)) {
			builder.add([ words, GraphBuilder.result(hasOpenHour) ], v => inDayPart(v[0], part));
		}

		return builder
			// An hour before or after lunch
			.add('efter lunch', (v, options: DateTimeOptions) => dayPart('lunch', options, 1))
			.add('efter lunchen', (v, options: DateTimeOptions) => dayPart('lunch', options, 1))
			.add('före lunch', (v, options: DateTimeOptions) => dayPart('lunch', options, -1))
			.add('före lunchen', (v, options: DateTimeOptions) => dayPart('lunch', options, -1))
			.add('innan lunch', (v, options: DateTimeOptions) => dayPart('lunch', options, -1))
			.add('innan lunchen', (v, options: DateTimeOptions) => dayPart('lunch', options, -1))

			// An hour in a part of the day, such as 9 på morgonen
			.add([ GraphBuilder.result(hasHour), 'på morgonen' ], v => toAM(v[0]))
			.add([ GraphBuilder.result(hasHour), 'på förmiddagen' ], v => toAM(v[0]))
			.add([ GraphBuilder.result(hasPmHour), 'på eftermiddagen' ], v => toPM(v[0]))
			.add([ GraphBuilder.result(hasPmHour), 'på kvällen' ], v => toPM(v[0]))
			.add([ GraphBuilder.result(hasHour), 'på natten' ], v => toNight(v[0]))

			// Approximate times
			.add([ 'cirka', GraphBuilder.result() ], v => withPrecision(v[0], Precision.Approximate))
			.add([ 'ca', GraphBuilder.result() ], v => withPrecision(v[0], Precision.Approximate))
			.add([ 'ungefär', GraphBuilder.result() ], v => withPrecision(v[0], Precision.Approximate))
			.add([ 'omkring', GraphBuilder.result() ], v => withPrecision(v[0], Precision.Approximate))
			.add([ 'runt', GraphBuilder.result() ], v => withPrecision(v[0], Precision.Approximate))
			.add([ GraphBuilder.result(), 'ungefär' ], v => withPrecision(v[0], Precision.Approximate))

			// Exact times
			.add([ 'exakt', GraphBuilder.result() ], v => withPrecision(v[0], Precision.Exact))
			.add([ 'precis', GraphBuilder.result() ], v => withPrecision(v[0], Precision.Exact))
			.add([ GraphBuilder.result(), 'exakt' ], v => withPrecision(v[0], Precision.Exact))
			.add([ GraphBuilder.result(), 'precis' ], v => withPrecision(v[0], Precision.Exact))
			.add([ GraphBuilder.result(), 'prick' ], v => withPrecision(v[0], Precision.Exact))

			// Named times
			.map(
				{
					'midnatt': 0,
					'middag': 12
				},
				v => time24h(v)
			)

			// HH, such as 4, 14
			.add(/^[0-9]{1,2}$/, v => plainNumberTime(time12h(parseInt(v[0], 10))))
			.add([ integer ], v => plainNumberTime(time12h(v[0].value)))

			// HH:MM and HH.MM, such as 00:10, 9:30, 14.00
			.add([ /^[0-9]{1,2}$/, ':', /^[0-9]{1,2}$/ ], v => {
				return time12h(parseInt(v[0], 10), parseInt(v[1], 10));
			})
			.add([ /^[0-9]{1,2}$/, '.', /^[0-9]{1,2}$/ ], v => {
				return time12h(parseInt(v[0], 10), parseInt(v[1], 10));
			})
			.add([ integer, ':', integer ], v => time12h(v[0].value, v[1].value))
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

			/*
			 * Swedish has no AM and PM, but splits the day into `förmiddag`
			 * and `eftermiddag`, written `fm` and `em`.
			 */
			.add([ GraphBuilder.result(hasPmHour), 'em' ], v => toPM(v[0]))
			.add([ GraphBuilder.result(hasPmHour), 'e.m.' ], v => toPM(v[0]))
			.add([ GraphBuilder.result(hasPmHour), 'eftermiddagen' ], v => toPM(v[0]))
			.add([ GraphBuilder.result(hasHour), 'fm' ], v => toAM(v[0]))
			.add([ GraphBuilder.result(hasHour), 'f.m.' ], v => toAM(v[0]))
			.add([ GraphBuilder.result(hasHour), 'förmiddagen' ], v => toAM(v[0]))

			.add([ relativeMinutes, 'i', GraphBuilder.result(isHour) ], v => adjustMinutes(v[1], - v[0]))
			.add([ relativeMinutes, 'före', GraphBuilder.result(isHour) ], v => adjustMinutes(v[1], - v[0]))

			.add([ relativeMinutes, 'över', GraphBuilder.result(isHour) ], v => adjustMinutes(v[1], v[0]))
			.add([ relativeMinutes, 'efter', GraphBuilder.result(isHour) ], v => adjustMinutes(v[1], v[0]))

			/*
			 * `halv tolv` is half an hour before twelve, the opposite of the
			 * English `half twelve`.
			 */
			.add([ 'halv', GraphBuilder.result(isHour) ], v => adjustMinutes(v[0], -30))

			// Qualifiers
			.add([ 'om', timeDuration ], v => v[0])
			.add([ timeDuration ], v => v[0])
			.add([ timeDuration, 'sedan' ], v => reverse(v[0]))
			.add([ 'för', timeDuration, 'sedan' ], v => reverse(v[0]))
			.add([ 'klockan', GraphBuilder.result() ], v => asTime(v[0]))
			.add([ 'kl', GraphBuilder.result() ], v => asTime(v[0]))
			.add([ 'kl.', GraphBuilder.result() ], v => asTime(v[0]))
			.add([ 'vid', GraphBuilder.result() ], v => asTime(v[0]))

			.build();
	}
};
