'use strict';

const Parser = require('../parser');
const TokenNode = require('../parser/token');
const ValueNode = require('./value');

const VALUE = /{([a-zA-Z0-9]+)}/g;

const { LanguageSpecificValue, ParsingValue } = require('../values');
const { isDeepEqual } = require('../utils/equality');

/**
 * Extension to the normal parser that handles refering to a values by
 * name in the text.
 *
 * TODO: Extended grammar for optional tokens and OR between tokens?
 */
class ResolverParser extends Parser {
	constructor(language) {
		super(language);

		this.values = {};

		this.fuzzy();
		this.allowPartial();
	}

	value(id, type) {
		let factory = type;
		if(factory instanceof LanguageSpecificValue) {
			factory = factory.create(this.language);
		}

		if(typeof factory === 'function') {
			const matcher = factory;
			factory = {
				match(encounter) {
					return matcher(encounter);
				}
			};
		}

		this.values[id] = factory;
		return this;
	}

	match(e, options={}) {
		options.matchIsEqual = options.partial
			? (a, b) => a.intent === b.intent && isDeepEqual(a.values, b.values)
			: (a, b) => a.intent === b.intent;

		return super.match(e, options);
	}

	parse(text) {
		let firstNode;
		let node;
		let parse = (from, to) => {
			let sub = text.substring(from, to);
			this.language.tokenize(sub).forEach(t => {
				if(t.length === 0) return;

				let nextNode = new TokenNode(this.language, t);

				if(node) {
					node.outgoing.push(nextNode);
				} else {
					firstNode = nextNode;
				}
				node = nextNode;
			});
		};

		let previousIndex = 0;
		VALUE.lastIndex = 0;
		let match;
		while((match = VALUE.exec(text))) {
			if(match.index !== 0) {
				parse(previousIndex, match.index);
			}
			previousIndex = VALUE.lastIndex;

			const id = match[1];
			const value = this.values[id];
			if(! value) {
				throw new Error('No type registered for ' + id);
			}

			let nextNode = value instanceof ParsingValue
				? value.toNode(id)
				: new ValueNode(id, value);

			if(node) {
				node.outgoing.push(nextNode);
			} else {
				firstNode = nextNode;
			}
			node = nextNode;
		}

		// Parse the remaining text
		parse(previousIndex, text.length);

		return firstNode;
	}
}

module.exports = ResolverParser;
