'use strict';

const en = require('../language/en');
const date = require('../values/date');

(async function() {
	const dateMatcher = date().matcher(en);

	// Function can be called with a string to parse and will return a promise
	const matchedYear = await dateMatcher('2018');
	console.log('Matched value:', matchedYear);
	console.log('As date:', matchedYear.toDate());

	// Options can be specified for relative dates
	const matchedRelative = await dateMatcher('in 2 days', { now: new Date(2018, 0, 1) });
	console.log('Relative time is:', matchedRelative.toDate());

	// Or to specify the start of the week (defaults to Sunday)
	const matchedWeek = await dateMatcher('start of week 12', { weekStartsOn: 1 /* 1 = Monday */ });
	console.log('Week 12 starts on:', matchedWeek.toDate());

	// Strings that can't be parsed resolve to null
	const invalidValue = await dateMatcher('not a date');
	console.log('Invalid value resolved to:', invalidValue);
})();
