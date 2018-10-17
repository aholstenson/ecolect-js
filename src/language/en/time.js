import GraphBuilder from '../../graph/builder';

import { combine, reverse } from '../../time/matching';
import { map, time12h, time24h, toAM, toPM } from '../../time/times';

function hasHour(v) {
	return v && typeof v.hour !== 'undefined';
}

function isHour(v) {
	return v && typeof v.hour !== 'undefined' && typeof v.minute === 'undefined';
}

function adjustMinutes(time, minutes) {
	return combine(time, {
		relativeMinutes: minutes
	});
}

export default function(language) {
	const integer = language.integer;
	const timeDuration = language.timeDuration;

	const relativeMinutes = new GraphBuilder(language)
		.name('relativeMinutes')

		.add([ GraphBuilder.result(integer, v => v.value >= 1 && v.value <= 3), 'quarters' ], v => v[0].value * 15)
		.add('quarter', 15)
		.add('half', 30)
		.add(integer, v => v[0].value)
		.add([ integer, 'minutes' ], v => v[0].value)

		.toMatcher();

	return new GraphBuilder(language)
		.name('time')

		.skipPunctuation()

		// Approximate times
		.add([ GraphBuilder.result(), 'ish' ], v => combine(v[0], { precision: 'approximate' }))
		.add([ GraphBuilder.result(), 'approximately' ], v => combine(v[0], { precision: 'approximate' }))
		.add([ 'about', GraphBuilder.result() ], v => combine(v[0], { precision: 'approximate' }))
		.add([ 'around', GraphBuilder.result() ], v => combine(v[0], { precision: 'approximate' }))
		.add([ 'approximately', GraphBuilder.result() ], v => combine(v[0], { precision: 'approximate' }))

		.add([ GraphBuilder.result(), 'amish' ], v => combine(toAM(v[0]), { precision: 'approximate' }))
		.add([ GraphBuilder.result(), 'pmish' ], v => combine(toPM(v[0]), { precision: 'approximate' }))

		// Exact times
		.add([ 'exactly', GraphBuilder.result() ], v => combine(v[0], { precision: 'exact' }))
		.add([ GraphBuilder.result(), 'exactly' ], v => combine(v[0], { precision: 'exact' }))
		.add([ GraphBuilder.result(), 'sharp' ], v => combine(v[0], { precision: 'exact' }))

		// Named times
		.map(
			{
				'midnight': 0,
				'noon': 12
			},
			v => time24h(v)
		)

		// HH, such as 4, 14
		.add(/^[0-9]{1,2}$/, v => time12h(parseInt(v[0])))
		.add([ integer ], v => time12h(v[0].value))

		// HH:MM, such as 00:10, 9:30, 14 00
		.add([ /^[0-9]{1,2}$/, ':', /^[0-9]{1,2}$/ ], v => {
			return time12h(parseInt(v[0]), parseInt(v[1]));
		})
		.add([ integer, ':', integer ], v => time12h(v[0].value, v[1].value))
		.add(/^[0-9]{3,4}$/, v => {
			const t = v[0];
			const h = t.length === 3 ? t.substring(0, 1) : t.substring(0, 2);
			const m = t.substring(t.length-2);
			return time12h(parseInt(h), parseInt(m));
		})

		// HH:MM:SS
		.add([ /^[0-9]{1,2}$/, ':', /^[0-9]{1,2}$/, ':', /^[0-9]{1,2}$/ ], v => {
			return time12h(parseInt(v[0]), parseInt(v[1]), parseInt(v[2]));
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
		.add([ timeDuration, 'ago' ], reverse)
		.add([ 'at', GraphBuilder.result() ], v => v[0])

		.mapResults(map)
		.onlyBest()
		.toMatcher();
}
