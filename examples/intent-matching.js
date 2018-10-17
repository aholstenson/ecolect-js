'use strict';

const { intentsBuilder } = require('../');
const en = require('../language/en');
const { any, date } = require('../values');

const intents = intentsBuilder(en)
	.intent('todo:list')
		.add('show me my todos')
		.done()
	.intent('todo:create')
		.value('text', any())
		.add('add {text}')
		.add('add {text} to my todo list')
		.add('add {text} to my todo')
		.done()
	.intent('todo:deadline')
		.value('date', date())
		.add('show me todos for {date}')
		.done()
	.build();

// Match the intent
intents.match('show me my todos')
	.then(results => {
		console.log('1', results);
	})
	.catch(err => {
		console.log(err);
	});

intents.match('show me todo for Friday')
	.then(results => {
		console.log('2', results);
	})
	.catch(err => {
		console.log(err);
	});

// Perform partial matching
intents.match('add', {
	partial: true
})
	.then(results => {
		console.log('3', results.best);
	})
	.catch(err => {
		console.log(err);
	});
