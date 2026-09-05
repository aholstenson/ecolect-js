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

			.add([ GraphBuilder.result(integer, v => v.value >= 1 && v.value <= 3), 'kvart' ], v => v[0].value * 15)
			.add('kvart', 15)
			.add('halv', 30)
			.add(integer, v => v[0].value)
			.add([ integer, 'minuter' ], v => v[0].value)
			.add([ integer, 'min' ], v => v[0].value)

			.build();

		return new GraphBuilder<DateTimeData>(language)
			.name('time')

			.skipPunctuation()

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
			.add([ GraphBuilder.result(hasHour), 'em' ], v => toPM(v[0]))
			.add([ GraphBuilder.result(hasHour), 'e.m.' ], v => toPM(v[0]))
			.add([ GraphBuilder.result(hasHour), 'eftermiddagen' ], v => toPM(v[0]))
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
			.add([ 'klockan', GraphBuilder.result() ], v => asTime(v[0]))
			.add([ 'kl', GraphBuilder.result() ], v => asTime(v[0]))
			.add([ 'kl.', GraphBuilder.result() ], v => asTime(v[0]))
			.add([ 'vid', GraphBuilder.result() ], v => asTime(v[0]))

			.build();
	}
};
