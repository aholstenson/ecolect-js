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
intents. This is done by matching one or more expressions to the intent.
While matching the library will fuzzy

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
