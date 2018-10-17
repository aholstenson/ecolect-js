---
layout: article
---

# Ecolect

Ecolect is a JavaScript library for matching natural language expressions such
as dates, times, numbers and phrases. Ecolect works both in Node and the
browser and currently supports English, but is extendable to new languages.

## Phrase matching

Phrase matching can be done via.

## Values

Values in Ecolect are built-in types that capture values in a natural language
format. They can either be used stand-alone or as part of [phrases](/phrases/).

Phrases in Ecolect can also contain values, there are several built in types and
it's easy to provide custom value validation. Values are used to capture
information, such as dates, numbers, names and freeform text.

### Stand-alone use

Most values can be turned into a matching function for a [language](/language/)
via the `matcher(language)` function:

```javascript
const matcherFunction = value.matcher(language);
```

Example matcher for a [date](/date-time/date/) using English:

```javascript
const en = require('ecolect/language/en');
const { date } = require('ecolect/values');

// Create a matcher for the date value
const dateMatcher = date().matcher(en);

// Call the matcher
dateMatcher('2018')
  .then(value => /* do something with the value */)
  .catch(err => /* handle errors */);

// Optionally specify options for parsing, such as what day the week starts on
dateMatcher('start of week 12', { weekStartsOn: 1 /* Monday*/ })
  .then(value => /* do something with the value */)
  .catch(err => /* handle errors */);
```

### Use in phrases

Values can be used in phrases by adding them to the builder and then using
them via the `{namedValue}` syntax:

```javascript
const { dateInterval } = require('ecolect/values');

builder
	.value('interval', dateInterval())
	.phrase('Completed {interval}');
```
