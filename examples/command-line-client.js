import { en } from 'ecolect/language/en';
import autocompletePrompt from 'cli-autocomplete';
import chalk from 'chalk';
import {
	anyTextValue,
	dateValue,
	enumerationValue,
	intentsBuilder,
	newPhrases,
	numberValue
} from 'ecolect';

const intents = intentsBuilder(en)
	.add('todo:list', newPhrases()
		.phrase('all todos')
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
		.value('count', numberValue())
		.phrase('todos for {date}')
		.phrase('show me todos for {date}')
		.phrase('top {count} for {date}')
		.build()
	)
	.add('todo:for', newPhrases()
		.value('tags', enumerationValue([ 'Cookie Co', 'Do Later' ]))
		.phrase('todos marked {tags}')
		.phrase('show me todos marked {tags}')
		.build()
	)
	.build();

function formatValue(value) {
	if(value) {
		if(value.value) {
			return value.value;
		} else if(value.toDate) {
			return value.toDate();
		}
	}

	return value;
}

function run() {
	autocompletePrompt('', query => {
		return intents.matchPartial(query)
			.then(matches => matches.map(item => {
				const title = item.expression.map(part => {
					switch(part.type) {
						case 'value':
							return chalk.green(formatValue(part.value) || part.id);
						default:
							return part.value;
					}
				}).join(' ');

				return {
					title: chalk.gray(item.score.toFixed(2)) + '  ' + title
				};
			}))
			.catch(err => console.log(err));
	}).on('submit', query => {
		if(! query) {
			run();
			return;
		}

		intents.match(query).then(match => {
			if(match) {
				console.log('Matched ' + match.id);
			} else {
				console.log('Did not match');
			}

			run();
		});
	});
}

console.log('Type to test matching');
run();
