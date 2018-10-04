'use strict';

const { map } = require('./dates');
const { cloneObject } = require('../utils/cloning');
const IntervalValue = require('./interval-value');

function applyRelationAndEdge(r, edge) {
	if(! r.intervalEdge) r.intervalEdge = edge;
	if(! r.relationToCurrent) r.relationToCurrent = 'current-period';
	return r;
}

module.exports.map = function(r, e) {
	let start = null;
	let end = null;

	if(r.end) {
		if(r.start) {
			/*
			* To support cases such where the end has a year set but not the start
			* we copy some selected fields.
			*/
			if(typeof r.start.year === 'undefined') r.start.year = r.end.year;
			if(typeof r.start.month === 'undefined') r.start.month = r.end.month;

			start = map(applyRelationAndEdge(cloneObject(r.start), 'start'), e);
			end = map(applyRelationAndEdge(r.end, 'end'), e, { now: start.toDate() });
		} else {
			end = map(applyRelationAndEdge(r.end, 'end'), e);
		}
	} else {
		// This interval has no end
		if(r.start) {
			// There is a start available - map it
			start = map(applyRelationAndEdge(r.start, 'start'), e);
		} else {
			// No start and no end - can't map this
			return null;
		}
	}

	return new IntervalValue(start, end);
};
