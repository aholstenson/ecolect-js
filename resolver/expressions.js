'use strict';

const TokenNode = require('../parser/token');
const SubNode = require('../parser/sub');
const ValueNode = require('./value');
const ValueParserNode = require('./value-parser');

/**
 * Refresh the expression by copying back values from the matches into the
 * expression and sub-expressions.
 */
const refresh = module.exports.refresh = function(v) {
	for(const e of v.expression) {
		if(e.type === 'value') {
			e.value = v.values[e.id];

			if(e.value && e.value.expression) {
				// The value has an expression - refresh it
				refresh(e.value);
			} else if(Array.isArray(e.value)) {
				// The value is an array, check if entries have expressions
				for(const e0 of e.value) {
					if(e0.expression) {
						refresh(e0);
					}
				}
			}
		}
	}
};

/**
 * Describe the expression for the given encounter.
 */
module.exports.describe = function(encounter) {
	// Partial matching so expose the full expression that would match
	let path = [];
	let text = [];

	const nodes = encounter.currentNodes;
	const tokens = encounter.currentTokens;

	const toPos = (c, p) => {
		if(! c) c = encounter.currentIndex;
		let start = -1;
		let end = -1;
		for(let i=p; i<c; i++) {
			const t = encounter.tokens[i];
			if(! t) continue;

			if(start === -1) start = t.start;

			end = t.stop;
		}
		return {
			start: start,
			end: end
		};
	};

	/*
	 * Scan backward to find the SubNode (if any) that has requested
	 * this expression.
	 */
	let start = 0;
	for(let i=nodes.length-3 /* collector -> sub */; i>=0; i--) {
		if(nodes[i] instanceof SubNode) {
			start = i + 1;
			break;
		}
	}

	let startToken = tokens[start];
	for(let i=start; i<nodes.length; i++) {
		const node = nodes[i];

		if(node instanceof TokenNode) {
			text.push(node.token.raw);
		} else if(node instanceof ValueNode || node instanceof ValueParserNode) {
			if(text.length > 0) {
				path.push({
					type: 'text',
					value: text.join(' '),

					source: toPos(tokens[i], startToken)
				});

				text.length = 0;
			}

			path.push({
				type: 'value',
				id: node.id,

				source: toPos(tokens[i+1], tokens[i])
			});

			startToken = tokens[i+1];
		}
	}

	if(text.length > 0) {
		path.push({
			type: 'text',
			value: text.join(' '),

			source: toPos(null, startToken)
		});
	}

	return path;
};
