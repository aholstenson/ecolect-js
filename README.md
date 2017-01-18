# Ecolect

Ecolect helps with mapping natural language to intents and values.

```
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
