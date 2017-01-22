'use strict';

const Node = require('./node');
const RegExpNode = require('./regexp');
const TokenNode = require('./token');
const SubNode = require('./sub');
const FilteredSubNode = require('./filtered-sub');
const CollectorNode = require('./collector');
const CustomNode = require('./custom');

const Encounter = require('./encounter');

class Parser extends Node {
	constructor(language) {
		super();

		this.language = language;
	}

	add(nodes, value) {
		if(! Array.isArray(nodes)) {
			nodes = [ nodes ];
		}

		let last = this;
		const push = node => {
			if(! (node instanceof Node)) {
				throw new Error('Not a node: ' + node);
			}

			last.outgoing.push(node);
			last = node;
		};

		const createNode = n => {
			if(typeof n === 'function') {
				const result = n(this);
				push(result);
			} else if(n instanceof RegExp) {
				push(new RegExpNode(n));
			} else if(n instanceof Parser) {
				push(new SubNode(n));
			} else if(n instanceof Node) {
				push(n);
			} else if(typeof n === 'string') {
				this.language.tokenize(n).forEach(t => {
					push(new TokenNode(this.language, t));
				});
			} else {
				throw new Error('Invalid node');
			}
		};

		nodes.forEach(createNode);

		push(new CollectorNode(nodes.length, value));

		return this;
	}

	parse(text) {
		let first;
		let last;
		this.language.tokenize(text).forEach(t => {
			const node = new TokenNode(this.language, t);
			if(last) {
				last.outgoing.push(node);
			} else {
				first = node;
			}
			last = node;
		});
		return first;
	}

	map(values, func) {
		Object.keys(values).forEach(k => this.add(k, func(values[k])));

		return this;
	}

	finalizer(func) {
		this._finalizer = func;
		return this;
	}

	match(encounter, options) {
		if(typeof encounter === 'string') {
			encounter = new Encounter(this.language, encounter, options || {});
			encounter.outgoing = this.outgoing;
		}

		let promise = encounter.next(0, 0);
		if(this._finalizer) {
			promise = promise.then(this._finalizer);
		}

		return promise;
	}

	toString() {
		return 'Parser[]';
	}

	static result(validator) {
		return function(parser) {
			return new FilteredSubNode(parser.outgoing, validator);
		};
	}

	static custom(validator) {
		return function() {
			return new CustomNode(validator);
		};
	}
}

module.exports = Parser;
