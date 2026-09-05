import { GraphBuilder } from '../../graph/index.js';
import {
	DateTimeData,

	combine,
	reverse,
	hasHour,
	isHour,

	time12h,
	time24h,
	toAM,
	toPM,

	asTime,
	plainNumberTime,

	Precision
} from '../../type-datetime/index.js';
import { LanguageGraphFactory } from '../index.js';

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

		return new GraphBuilder<DateTimeData>(language)
			.name('time')

			.skipPunctuation()

			// Approximate times
			.add([ GraphBuilder.result(), 'ish' ], v => withPrecision(v[0], Precision.Approximate))
			.add([ GraphBuilder.result(), 'approximately' ], v => withPrecision(v[0], Precision.Approximate))
			.add([ 'about', GraphBuilder.result() ], v => withPrecision(v[0], Precision.Approximate))
			.add([ 'around', GraphBuilder.result() ], v => withPrecision(v[0], Precision.Approximate))
			.add([ 'approximately', GraphBuilder.result() ], v => withPrecision(v[0], Precision.Approximate))

			.add([ GraphBuilder.result(), 'amish' ], v => combine(toAM(v[0]), { precision: Precision.Approximate }))
			.add([ GraphBuilder.result(), 'pmish' ], v => combine(toPM(v[0]), { precision: Precision.Approximate }))

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

			// HH, such as 4, 14
			.add(/^[0-9]{1,2}$/, v => plainNumberTime(time12h(parseInt(v[0], 10))))
			.add([ integer ], v => plainNumberTime(time12h(v[0].value)))

			// HH:MM, such as 00:10, 9:30, 14 00
			.add([ /^[0-9]{1,2}$/, ':', /^[0-9]{1,2}$/ ], v => {
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

			.add([ GraphBuilder.result(hasHour), 'pm' ], v => toPM(v[0]))
			.add([ GraphBuilder.result(hasHour), 'p.m.' ], v => toPM(v[0]))
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
