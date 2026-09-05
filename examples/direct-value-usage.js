import { en } from 'ecolect/language/en';
import { dateValue } from 'ecolect';

const dateMatcher = dateValue().matcher(en);

// The matcher takes a string to parse and returns a promise
const matchedYear = await dateMatcher.match('2018');
console.log('Matched value:', matchedYear);
console.log('As date:', matchedYear?.toDate());

// Relative dates are resolved against the current time
const tomorrow = await dateMatcher.match('tomorrow');
console.log('Tomorrow:', tomorrow);

// Pass `now` to resolve against a fixed point in time instead
const fixed = await dateMatcher.match('in 2 days', { now: new Date(2018, 0, 1) });
console.log('Two days after 2018-01-01:', fixed);
