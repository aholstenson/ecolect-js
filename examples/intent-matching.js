import { en } from 'ecolect/language/en';
import { anyTextValue, dateValue, intentsBuilder, newPhrases } from 'ecolect';

const intents = intentsBuilder(en)
	.add('todo:list', newPhrases()
		.phrase('show me my todos')
		.build()
	)
	.add('todo:create', newPhrases()
		.value('text', anyTextValue())
		.phrase('add {text}')
		.phrase('add {text} to my todo list')
		.phrase('add {text} to my todo')
		.build()
	)
	.add('todo:deadline', newPhrases()
		.value('date', dateValue())
		.phrase('show me todos for {date}')
		.build()
	)
	.build();

// Match a single intent, or `null` when nothing matches
const match = await intents.match('show me my todos');
console.log('Matched intent:', match?.id);

// Match with a value in it
const withValue = await intents.match('add Do the dishes to my todo list');
console.log('Matched intent:', withValue?.id);
console.log('Values:', withValue?.values);

// Partial matching returns every intent that could still be completed
const partial = await intents.matchPartial('show me');
for(const item of partial) {
	console.log('Could become:', item.id);
}
