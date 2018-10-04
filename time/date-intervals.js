'use strict';

const { map } = require('./dates');
const IntervalValue = require('./interval-value');

module.exports.map = function(r, e) {
	const startEdge = r.start.intervalEdge;
	if(! r.start.intervalEdge) r.start.intervalEdge = 'start';
	if(! r.start.relationToCurrent) r.start.relationToCurrent = 'current-period';

	const start = map(r.start, e);
	let end;
	if(r.end) {
		if(! r.end.intervalEdge) r.end.intervalEdge = 'end';
		end = map(r.end, e, { now: start.toDate() });
	} else {
		if(! startEdge) r.start.intervalEdge = 'end';
		end = map(r.start, e);
	}

	return new IntervalValue(start, end);
};
