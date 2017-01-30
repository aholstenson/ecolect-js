# Ecolect

[![npm version](https://badge.fury.io/js/ecolect.svg)](https://badge.fury.io/js/ecolect)
[![Build Status](https://travis-ci.org/aholstenson/ecolect-js.svg?branch=master)](https://travis-ci.org/aholstenson/ecolect-js)
[![Coverage Status](https://coveralls.io/repos/aholstenson/ecolect-js/badge.svg)](https://coveralls.io/github/aholstenson/ecolect-js)
[![Dependencies](https://david-dm.org/aholstenson/ecolect-js.svg)](https://david-dm.org/aholstenson/ecolect-js)

Ecolect helps with parsing natural language to intents and values. This can be
used as a part in building a natural language interface for things such as bots,
voice or search interfaces.

## Installation

```
$ npm install --save ecolect
```

## Matching intents

The main function of Ecolect is to match natural language expressions to
intents. Every expression is parsed into tokens that are matched and scored
using a language specific comparison function. This allows the library to
match for example `cookies` even if the user skipped the last `s` and entered
`cookie` instead.

Matching can also be run in two modes:

* Normal mode - Match a full expression to an intent, which is best used when building a bot or a voice interface.
* Partial mode - Match most of the expression, for example when building an action launcher or a auto-complete for a search engine

### Example

```javascript
const ecolect = require('ecolect');
const en = require('ecolect/language/en');
const any = require('ecolect/values/any');

const intents = ecolect.intents(en)
	.intent('lights:on')
		.value('room', any())
		.add('turn lights on')
		.add('turn lights in {room} on')
		.done()
	.intent('lights:off')
		.value('room', any())
		.add('turn lights off')
		.add('turn lights in {room} off')
		.done()
	.build();

// Normal mode - match the best
intents.match('turn lights off')
	.then(results => {
		if(results.best) {
			// One of the expressions matched
			console.log('Intent:', results.best.intent);
			console.log('Values:', results.best.values)

			// results.matches will contain the top matches if anything else matched as well
		}
	});

intents.match('turn lights', { partial: true })
	.then(results => {
		results.matches.forEach(match => console.log(match));
	});
```

## Values

Intents in Ecolect can also contain values, there are several built in types and
it's easy to provide custom value validation. Values are used to capture
information, such as dates, numbers, names and freeform text.

### Integer

Capture any positive integer number.

Language         | Examples
-----------------|-------------
English          | `20`, `zero`, `one million`, `4 000`, `1 dozen`, `100k`

#### Returned value

The returned value is a simple object with one key named `value`.

```javascript
{ value: 2 }
```

#### Example

```javascript
const integer = require('ecolect/values/integer');

builder.intent('list')
	.value('count', integer())
	.add('Show top {count} items')
	.done();
```


### Number

Capture any number, including numbers with a fractional element.

Language         | Examples
-----------------|-------------
English          | `20`, `2.4 million`, `8.0`, `-12`

#### Returned value

The returned value is a simple object with one key named `value`.

```javascript
{ value: 2.4 }
```

#### Example

```javascript
const number = require('ecolect/values/number');

builder.intent('add')
	.value('amount', number())
	.add('Add {amount} to result')
	.done();
```

### Ordinal

Capture an ordinal, such as `1st`, indicating a position.

Language         | Examples
-----------------|-------------
English          | `1st`, `third`, `3`, `the fifth`

#### Returned value

The returned value is a simple object with one key named `value`.

```javascript
{ value: 5 }
```

#### Example

```javascript
const ordinal = require('ecolect/values/ordinal');

builder.intent('pick')
	.value('position', ordinal())
	.add('Show {position} in the list')
	.done();
```

### Date

Capture a date representing a single day.

Language         | Examples
-----------------|-------------
English          | `today`, `in 2 days`, `january 12th`, `2010-02-22`, `02/22/2010`, `first friday in 2020`

#### Returned value

The returned value is an object with the keys `year`, `month`, `day` and can
be turned into a `Date` via the function `toDate`.

```javascript
const date = value.toDate();
```

#### Example

```javascript
const date = require('ecolect/values/date');

builder.intent('deadline')
	.value('date', date())
	.add('Set deadline to {date}')
	.done();
```

### Time

Capture a time of day.

Language         | Examples
-----------------|-------------
English          | `09:00`, `3 pm`, `at 3:30 am`, `noon`, `quarter to twelve`, `in 2 hours`, `in 45 minutes`

#### Returned value

The returned value is an object with the keys `hour`, `minute`, `second` and can
be turned into a `Date` via the function `toDate`.

```javascript
const date = value.toDate();
```

#### Example

```javascript
const time = require('ecolect/values/time');

builder.intent('alarm')
	.value('time', time())
	.add('Wake me {time}')
	.done();
```

### Date & Time

Capture both a date and a time.

Language         | Examples
-----------------|-------------
English          | `3pm on Jan 12th`, `in 2 days and 2 hours`, `14:00`

```javascript
const datetime = require('ecolect/values/datetime');

builder.intent('schedule')
	.value('when', datetime())
	.add('Schedule a call {when}')
	.done();
```

### Enumeration

Capture one of the specified values. Used to specify one or more values that
should match.

```javascript
const enumeration = require('ecolect/values/enumeration');

builder.intent('list')
	.value('type', enumeration([
		'Balloons',
		'Cookies',
		'Tasty Cake'
	]))
	.add('Show me the last {type}')
	.done();
```

### Text

Text can be captured with the type `any`. You can use `any` for things such as
search queries, todo items and calendar events. Values of type `any` will
always try to capture as much as they can and will not validate the result.

```javascript
const any = require('ecolect/values/any');

builder.intent('echo')
	.value('text', any())
	.add('Echo {text}')
	.done();
```
