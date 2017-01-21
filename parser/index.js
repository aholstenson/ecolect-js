'use strict';

const Node = require('./node');
const RegExpNode = require('./regexp');
const TokenNode = require('./token');
const SubNode = require('./sub');
const FilteredSubNode = require('./filtered-sub');
const CollectorNode = require('./collector');

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
			last.outgoing.push(node);
			last = node;
		};

		nodes.forEach(n => {
			if(typeof n === 'function') {
				push(new FilteredSubNode(this.outgoing, n));
			} else if(n instanceof RegExp) {
				push(new RegExpNode(n));
			} else if(n instanceof Node) {
				push(new SubNode(n));
			} else {
				this.language.tokenize(n).forEach(t => {
					push(new TokenNode(this.language, t));
				});
			}
		});

		push(new CollectorNode(value));

		return this;
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
}

module.exports = Parser;
