# Ecolect

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

## Example

```javascript
const ecolect = require('ecolect');
const en = require('ecolect/language/en');
const any = require('ecolect/values/any');

const intents = ecolect.builder(en)
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

intents.match('turn lights off')
	.then(results => {
		if(results.best) {
			console.log('Intent: ', results.best.intent);
		}
	});
```
