'use strict';

const ecolect = require('../');
const en = require('../language/en');
const any = require('../values/any');
const date = require('../values/date');

const intents = ecolect.builder(en)
	.intent('todo:list')
		.add('show me my todos')
		.done()
	.intent('todo:create')
		.value('text', any)
		.add('add {text}')
		.add('add {text} to my todo list')
		.add('add {text} to my todo')
		.done()
	.intent('todo:deadline')
		.value('date', date)
		.add('show me todos for {date}')
		.done()
	.build();

// Match the intent
intents.match('show me my todos')
	.then(results => {
		console.log('1', results);
	});

intents.match('show me todos for Friday')
	.then(results => {
		console.log('2', results);
	});

// Perform partial matching
intents.match('add', {
	partial: true
})
	.then(results => {
		console.log('3', results.best);
	})
	.catch(console.err);
