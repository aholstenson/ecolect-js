'use strict';

const Resolver = require('./index');
const Token = require('./token');
const Value = require('./value');
const Collector = require('./collector');

const VALUE = /{([a-zA-Z0-9]+)}/g;

/**
 * This is a basic naive builder for instances of Resolver. It adds all
 * expressions as individual roots.
 */
class Builder {
	constructor(language, data) {
		this.language = language;

		this.values = {};
		this.roots = [];

		this.collector = new Collector(data);
	}

	value(id, type) {
		this.values[id] = type;
		return this;
	}

	add(text) {
		if(text instanceof Resolver) {
			text.roots.forEach(r => this.roots.push(r));
			return this;
		}

		let firstNode;
		let node;
		let parse = (from, to) => {
			let sub = text.substring(from, to);
			this.language.tokenize(sub).forEach(t => {
				if(t.length == 0) return;

				let nextNode = new Token(this.language, t);

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
			if(match.index != 0) {
				parse(previousIndex, match.index);
			}
			previousIndex = VALUE.lastIndex;

			const id = match[1];
			const value = this.values[id];
			if(! value) {
				throw new Error('No type registered for ' + id);
			}

			let nextNode = new Value(id, value);
			if(node) {
				node.outgoing.push(nextNode);
			} else {
				firstNode = nextNode;
			}
			node = nextNode;
		}

		// Parse the remaining text
		parse(previousIndex, text.length);

		// Push the collector and register the new root
		node.outgoing.push(this.collector);
		this.roots.push(firstNode);

		return this;
	}

	build() {
		// TODO: Simplify the roots to make the algorithm run faster

		return new Resolver(this.language, this.roots);
	}
}

module.exports = Builder;
