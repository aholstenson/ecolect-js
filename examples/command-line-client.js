import { en } from 'ecolect/language/en';
import search from '@inquirer/search';
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

/**
 * Turn a captured value into something readable. Values are objects such as
 * `LocalDate` and `BigDecimal` that all format themselves via `toString`.
 */
function formatValue(value) {
	return String(value);
}

/**
 * Render a partial match as the phrase it would become. Values that have not
 * been said yet are shown as `{name}` placeholders.
 */
function formatExpression(match) {
	return match.expression
		.map(part => {
			if(part.type === 'value') {
				return chalk.green(part.value === undefined || part.value === null
					? '{' + part.id + '}'
					: formatValue(part.value));
			}

			return part.value;
		})
		.join(' ');
}

console.log('Type to test matching. Pick a suggestion with Enter, quit with Ctrl+C.');

while(true) {
	let match;
	try {
		// `source` runs on every keystroke, so partial matching drives the list
		match = await search({
			message: 'Match:',
			source: async term => {
				const matches = await intents.matchPartial(term ?? '');
				return matches.map(item => ({
					name: chalk.gray(item.score.toFixed(2)) + '  ' + formatExpression(item),
					value: item,
					description: 'Intent: ' + item.id
				}));
			}
		});
	} catch(err) {
		// Ctrl+C rejects the prompt, which ends the session
		if(err.name === 'ExitPromptError') break;

		throw err;
	}

	console.log('Matched ' + match.id);

	const values = Object.entries(match.values);
	if(values.length > 0) {
		for(const [ key, value ] of values) {
			console.log('  ' + key + ': ' + formatValue(value));
		}
	}
}
