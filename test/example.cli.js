'use strict';

const autocompletePrompt = require('cli-autocomplete');
const chalk = require('chalk');

const ecolect = require('../');
const en = require('../language/en');
const any = require('../values/any');
const date = require('../values/date');
const enumeration = require('../values/enum');

const intents = ecolect.intents(en)
	.intent('todo:list')
		.add('all todos')
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
		.add('todos for {date}')
		.add('show me todos for {date}')
		.done()
	.intent('tods:for')
		.value('tags', enumeration([ 'Cookie Co', 'Do Later' ]))
		.add('todos marked {tags}')
		.add('show me todos marked {tags}')
		.done()
	.build();


function run() {
	autocompletePrompt('', query => {
		return intents.match(query, {
			partial: true
		}).then(results =>
			(results.matches || []).map(item => {
				const title = item.expression.map(e => {
					switch(e.type) {
						case 'value':
							return chalk.green(e.value || e.id);
						default:
							return e.value;
					}
				}).join(' ');
				return {
					title: chalk.gray(item.score.toFixed(2)) + '  ' + title
				}
			})
		);
	}).on('submit', query => {
		if(! query) {
			run();
			return;
		}

		intents.match(query).then(r => {
			if(r.best) {
				console.log('Matched ' + r.best.intent);
			} else {
				console.log('Did not match');
			}

			run();
		});
	});
}

console.log('Type to test matching');
run();
