'use strict';

const { map } = require('./dates');
const IntervalValue = require('./interval-value');

module.exports.map = function(r, e) {
	r.start.intervalEdge = 'start';

	// Check if the

	const start = map(r.start, e);
	let end;
	if(r.end) {
		r.end.intervalEdge = 'end';
		end = map(r.end, e);
	} else {
		r.start.intervalEdge = 'end';
		end = map(r.start, e);
	}

	return new IntervalValue(start, end);
};
