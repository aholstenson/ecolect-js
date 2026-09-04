/*
 * Generate `src/matchers.ts` from the Unicode character databases. Run as part
 * of the build, so the generated file always matches the data currently
 * installed.
 */
import { writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import regenerate from 'regenerate';

const require = createRequire(import.meta.url);
const here = dirname(fileURLToPath(import.meta.url));

const codePoints = name => require('unicode-9.0.0/' + name + '/code-points.js');

const matchers = {};

matchers.emoji = regenerate()
	.add(codePoints('Word_Break/E_Base'))
	.add(codePoints('Word_Break/E_Base_GAZ'))
	.add(codePoints('Word_Break/E_Modifier'))
	.toString();

matchers.emojiModifier = regenerate()
	.add(codePoints('Word_Break/E_Modifier'))
	.toString();

matchers.regionalIndicator = regenerate()
	.add(codePoints('Word_Break/Regional_Indicator'))
	.toString();

matchers.wordish = regenerate()
	.add(codePoints('Binary_Property/Alphabetic'))
	.add(codePoints('General_Category/Mark'))
	.add(codePoints('General_Category/Connector_Punctuation'))
	.add(codePoints('Binary_Property/Join_Control'))
	.add('\'')
	.toString();

matchers.numeric = regenerate()
	.add(codePoints('General_Category/Decimal_Number'))
	.toString();

matchers.punctuation = regenerate()
	.add(codePoints('General_Category/Punctuation'))
	.toString();

const source = Object.keys(matchers).map(name =>
	'/* eslint-disable */ export const ' + name + ' = ' + JSON.stringify(matchers[name]) + ';'
).join('');

writeFileSync(join(here, '..', 'src', 'matchers.ts'), source);
