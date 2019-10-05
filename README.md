# Ecolect

[![npm version](https://badge.fury.io/js/ecolect.svg)](https://badge.fury.io/js/ecolect)
[![Build Status](https://travis-ci.org/aholstenson/ecolect-js.svg?branch=master)](https://travis-ci.org/aholstenson/ecolect-js)
[![Coverage Status](https://coveralls.io/repos/aholstenson/ecolect-js/badge.svg)](https://coveralls.io/github/aholstenson/ecolect-js)
[![Dependencies](https://david-dm.org/aholstenson/ecolect-js.svg)](https://david-dm.org/aholstenson/ecolect-js)

Ecolect is a library for JavaScript and TypeScript that helps with matching
natural language phrases and values. This can be used as a part in building a
natural language interface for things such as bots, voice or search interfaces.

## Installation

```
$ npm install --save ecolect
```

# Features

* Natural language parsing of different values, such as:
  * Dates and times (via `dateValue`, `timeValue` and `dateTimeValue`)
  * Date intervals (via `dateIntervalValue`)
  * Durations (via `dateDurationValue`, `timeDurationValue` and `dateTimeDurationValue`)
  * Numbers (via `ordinalValue`, `numberValue` and `integerValue`)
* Matching of phrases, including value extraction
* Partial matching of phrases, for auto-complete uses such as action launches

### Examples

Using a value:

```javascript
import { en } from 'ecolect/language/en';
import { dateValue } from 'ecolect';

const matcher = dateValue().toMatcher(en);
const bestMatch = await matcher.match('first Monday of 2021');
```

Matching phrases:

```javascript
import { en } from 'ecolect/language/en';
import { newPhrases, dateIntervalValue } from 'ecolect';

const matcher = newPhrases()
  .value('when', dateIntervalValue())
  .phrase('Show todos due {when}')
  .phrase('Todos due {when}')
  .toMatcher(en);

const bestMatch = await matcher.match('todo due today');
```

Combining phrases:

```javascript
import { en } from 'ecolect/language/en';
import { intentsBuilder, newPhrases, dateIntervalValue } from 'ecolect';

const matcher = intentsBuilder(en)
  .add('orders', newPhrases()
    .phrase('Orders')
    .phrase('Show orders')
    .build()
  )
  .add('orders:active', newPhrases()
    .phrase('Orders that are active')
    .phrase('Show orders that are active')
    .build()
  )
  .build();

const bestMatch = await matcher.match('orders');

// Or partially match
const matches = await matcher.matchPartial('orders);
```

## Options

Option                  | Default      | Description
------------------------|--------------|-------------
`now`                   | `new Date()` | Date to use as a base for times and dates parsed
`weekStartsOn`          | `0` (Sunday) | The day the week starts on
`firstWeekContainsDate` | `1`          | The day of January which is always in the first week of the year.

### A note about weeks

It's important to set `weekStartsOn` and `firstWeekContainsDate` to something
expected by the user. The default value for `weekStartsOn` is `0` which
indicates that weeks start on Sunday.

`firstWeekContainsDate` defaults to `1` which is commonly used in North America
and Islamic date systems. Countries that use this week numbering include
Canada, United States, India, Japan, Taiwan, Hong Kong, Macau, Israel,
Egypt, South Africa, the Phillippines and most of Latin America.

For EU countries most of them use Mondays as the start of the week and the ISO
week system. Settings `weekStartsOn` to `1` and `firstWeekContainsDate` to `4`
will set weeks to a style used in EU and most other European countries, most
of Acia and Oceania.

Middle Eastern countries commonly use Saturday as their first day of week and
a week numbering system where the first week of the year contains January 1st.
Set `weekStartsOn` to `6` and `firstWeekContainsDate` to `1` to use this
style of week.

For more information about week numbering see the [Week article on Wikipedia](https://en.wikipedia.org/wiki/Week#Week_numbering).

## Value types

### Integer

```javascript
import { integerValue } from 'ecolect';

const value = integerValue();
```

Capture any positive integer number.

Language         | Examples
-----------------|-------------
English          | `20`, `zero`, `one million`, `4 000`, `1 dozen`, `100k`

#### Returned value

The returned value is a `BigInteger` from [numeric-types](https://github.com/aholstenson/numeric-types).

### Number

```javascript
import { numberValue } from 'ecolect';

const value = numberValue();
```

Capture any number, including numbers with a fractional element.

Language         | Examples
-----------------|-------------
English          | `20`, `2.4 million`, `8.0`, `-12`

#### Returned value

The returned value is a `BigDecimal` from [numeric-types](https://github.com/aholstenson/numeric-types).

### Ordinal

```javascript
import { ordinalValue } from 'ecolect';

const value = ordinalValue();
```

Capture an ordinal, such as `1st`, indicating a position.

Language         | Examples
-----------------|-------------
English          | `1st`, `third`, `3`, `the fifth`

#### Returned value

The returned value is a `BigInteger` from [numeric-types](https://github.com/aholstenson/numeric-types).

### Date

```javascript
import { dateValue } from 'ecolect';

const value = dateValue();
```

Capture a date representing a single day.

Language         | Examples
-----------------|-------------
English          | `today`, `in 2 days`, `january 12th`, `2010-02-22`, `02/22/2010`, `first friday in 2020`

#### Returned value

The returned value is a `LocalDate` from [datetime-types](https://github.com/aholstenson/datetime-types).

### Time

```javascript
import { timeValue } from 'ecolect';

const value = timeValue();
```

Capture a time of day.

Language         | Examples
-----------------|-------------
English          | `09:00`, `3 pm`, `at 3:30 am`, `noon`, `quarter to twelve`, `in 2 hours`, `in 45 minutes`

#### Returned value

The returned value is a `LocalTime` from [datetime-types](https://github.com/aholstenson/datetime-types).

### Date & Time

```javascript
import { dateTimeValue } from 'ecolect';

const value = dateTimeValue();
```

Capture both a date and a time.

Language         | Examples
-----------------|-------------
English          | `3pm on Jan 12th`, `in 2 days and 2 hours`, `14:00`

#### Returned value

The returned value is a `LocalDateTime` from [datetime-types](https://github.com/aholstenson/datetime-types).

### Date Interval

```javascript
import { dateIntervalValue } from 'ecolect';

const value = dateIntervalValue();
```

Capture an interval between two dates.

Language         | Examples
-----------------|-------------
English          | `today`, `this month`, `February to March`, `2018-01-01 to 2018-04-05`, `January 15th - 18th`

#### Returned value

The returned value is a `DateInterval` from [datetime-types](https://github.com/aholstenson/datetime-types).

### Date Duration

```javascript
import { dateDurationValue } from 'ecolect';

const value = dateDurationValue();
```

Capture a duration.

Language         | Examples
-----------------|-------------
English          | `2 days`, `2m, 1d`, `1 year and 2 days`, `4y 2m`, `1 week`

#### Returned value

### Time Duration

```javascript
import { timeDurationValue } from 'ecolect';

const value = timeDurationValue();
```

Capture a duration of hours, minutes, seconds and miliseconds.

Language         | Examples
-----------------|-------------
English          | `2 hours`, `1s`, `2h, 45m`, `4 minutes and 10 seconds`

#### Returned value

### Date & Time Duration

```javascript
import { dateTimeDurationValue } from 'ecolect';

const value = dateTimedurationValue();
```

Capture a duration of both days, hours, minutes, seconds and miliseconds.

Language         | Examples
-----------------|-------------
English          | `2 hours`, `2 d 20 m`, `4 weeks and 10 minutes`

#### Returned value

### Enumeration

```javascript
import { enumerationValue } from 'ecolect';

const value = enumerationValue([
  'Option 1',
  'Other option'
]);
```

Capture one of the specified values. Used to specify one or more values that
should match.

### Text

```javascript
import { anyTextValue } from 'ecolect';

const value = anyTextValue();
```

Text can be captured with the type `anyTextValue`. You can use `anyTextValue`
for things such as search queries, todo items and calendar events. Values of
type `anyTextValue` will always try to capture as much as they can and will not
validate the result.
