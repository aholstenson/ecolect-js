import { en } from 'ecolect/language/en';
import { dateValue, numberValue } from 'ecolect';

const dateMatcher = dateValue().matcher(en);

// The matcher takes a string to parse and returns a promise
const matchedYear = await dateMatcher.match('2018');

// Dates resolve to `LocalDate` from datetime-types, which has no time zone
console.log('Matched value:', matchedYear?.toString());
console.log('As a Date in the local zone:', matchedYear?.toDateAtMidnight());

// Relative dates are resolved against the current time
const tomorrow = await dateMatcher.match('tomorrow');
console.log('Tomorrow:', tomorrow?.toString());

// Pass `now` to resolve against a fixed point in time instead
const fixed = await dateMatcher.match('in 2 days', { now: new Date(2018, 0, 1) });
console.log('Two days after 2018-01-01:', fixed?.toString());

// Numbers resolve to `BigDecimal` from numeric-types
const numberMatcher = numberValue().matcher(en);
const amount = await numberMatcher.match('2.4 million');
console.log('Number:', amount?.toString());

// A string that means nothing to the matcher resolves to `null`
console.log('No match:', await dateMatcher.match('not a date at all'));
