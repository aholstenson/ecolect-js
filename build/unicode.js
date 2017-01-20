'use strict'

const fs = require('fs');
const path = require('path');

const regenerate = require('regenerate');

const matchers = {};

matchers['emoji'] = regenerate()
	.add(require('unicode-9.0.0/Word_Break/E_Base/code-points.js'))
	.add(require('unicode-9.0.0/Word_Break/E_Base_GAZ/code-points.js'))
	.add(require('unicode-9.0.0/Word_Break/E_Modifier/code-points.js'))
	.toString();

matchers['emojiModifier'] = regenerate()
	.add(require('unicode-9.0.0/Word_Break/E_Modifier/code-points.js'))
	.toString();

matchers['regionalIndicator'] = regenerate()
	.add(require('unicode-9.0.0/Word_Break/Regional_Indicator/code-points.js'))
	.toString();

matchers['wordish'] = regenerate()
	.add(require('unicode-9.0.0/Binary_Property/Alphabetic/code-points.js'))
	.add(require('unicode-9.0.0/General_Category/Mark/code-points.js'))
	.add(require('unicode-9.0.0/General_Category/Connector_Punctuation/code-points.js'))
	.add(require('unicode-9.0.0/Binary_Property/Join_Control/code-points.js'))
	.add('\'')
	.toString();

matchers['numeric'] = regenerate()
	.add(require('unicode-9.0.0/General_Category/Decimal_Number/code-points.js'))
	.toString();

fs.writeFileSync(
	path.join(__dirname, '..', 'language', 'matchers.js'),
	'/* eslint-disable */ module.exports = ' + JSON.stringify(matchers) + ';'
);
