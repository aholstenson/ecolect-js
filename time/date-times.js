'use strict';

const { map: mapDate } = require('./dates');
const { map: mapTime } = require('./times');

module.exports.map = function(r, e) {
	const result = mapDate(r, e);

	return mapTime(r, e, result.toDate(), result);
};
