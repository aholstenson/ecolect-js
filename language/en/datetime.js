'use strict';

const Parser = require('../../parser');
const utils = require('../dates');

module.exports = function(language) {
	const time = language.time;
	const date = language.date;

	return new Parser(language)
		.name('datetime')

		.skipPunctuation()

		.add([ time, date ], v => utils.combine(v[0], v[1]))
		.add([ time, 'and', date ], v => utils.combine(v[0], v[1]))

		.add([ date, time ], v => utils.combine(v[0], v[1]))
		.add([ date, 'and', time ], v => utils.combine(v[0], v[1]))

		.add(Parser.result(date, utils.isRelative), (v, e) => {
			const now = utils.currentTime(e);
			return utils.combine(v[0], {
				hour: now.getHours(),
				minute: now.getMinutes()
			});
		})
		.add(time, v => v[0])

		.mapResults(utils.mapDateTime)
		.onlyBest();
};
