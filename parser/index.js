'use strict';

const Node = require('./node');
const RegExpNode = require('./regexp');
const TokenNode = require('./token');
const SubNode = require('./sub');
const CollectorNode = require('./collector');
const CustomNode = require('./custom');

const Encounter = require('./encounter');

class Parser extends Node {
	constructor(language, options) {
		super();

		this.language = language;
		this.needsAll = (options && options.needsAll) || false;

		this.supportsPartial = false;
		this._skipPunctuation = false;
		this._fuzzy = false;

		this._cache = {};
	}

	name(name) {
		this._name = this.language.id + ':' + name;
		return this;
	}

	allowPartial() {
		this.supportsPartial = true;
		return this;
	}

	skipPunctuation() {
		this._skipPunctuation = true;
		return this;
	}

	fuzzy() {
		this._fuzzy = true;
		return this;
	}

	add(nodes, value) {
		if(! Array.isArray(nodes)) {
			nodes = [ nodes ];
		}

		let values = 0;
		let last = this;
		const push = node => {
			if(! (node instanceof Node)) {
				throw new Error('Not a node: ' + node);
			}

			/**
			 * Check if we can attach to an existing node or if we need to
			 * create a new branch.
			 */
			for(let i=0; i<last.outgoing.length; i++) {
				if(last.outgoing[i].equals(node)) {
					last = last.outgoing[i];
					mergeOutgoing(node);
					return node;
				}
			}

			last.outgoing.push(node);
			last = node;

			// TODO: This needs to handle multiple nodes and multiple outgoing
			mergeOutgoing(last);

			return node;
		};

		const mergeOutgoing = node => {
			// TODO: This needs to handle multiple nodes and multiple outgoing
			if(node.outgoing.length === 1) {
				push(node.outgoing[0]);
			} else if(node.outgoing.length > 1) {
				throw new Error('Too many outgoing nodes, branching is not supported yet');
			}
		};

		const createNode = n => {
			if(typeof n === 'function') {
				const result = n(this);
				return push(result);
			} else if(n instanceof RegExp) {
				return push(new RegExpNode(n));
			} else if(n instanceof Parser) {
				return push(new SubNode(n));
			} else if(n instanceof Node) {
				return push(n);
			} else if(typeof n === 'string') {
				return push(this.parse(n));
			} else {
				throw new Error('Invalid node');
			}
		};

		nodes.forEach(n => {
			let r = createNode(n);
			if(r && ! (r instanceof TokenNode)) {
				values++;
			}
		});

		push(new CollectorNode(values, value, this.needsAll));

		return this;
	}

	parse(text) {
		let first;
		let last;
		this.language.tokenize(text).forEach(t => {
			if(this._skipPunctuation && t.punctuation) {
				return;
			}

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

	mapResults(mapper) {
		this._mapper = mapper;

		return this;
	}

	finalizer(func) {
		if(this._finalizer) {
			const previous = this._finalizer;
			this._finalizer = function(results, encounter) {
				return func(previous(results, encounter));
			}
		} else {
			this._finalizer = func;
		}
		return this;
	}

	onlyBest() {
		return this.finalizer((results, encounter) => {
			let best;
			for(let i=0; i<results.length; i++) {
				const result = results[i];
				if(! best || result.score > best.score) {
					best = result;
				}
			}

			let data = best ? best.data : null;
			if(data && this._mapper) {
				data = this._mapper(data, encounter);
			}
			return data;
		});
	}

	onlyLongest() {
		return this.finalizer((results, encounter) => {
			let best;
			for(let i=0; i<results.length; i++) {
				const result = results[i];
				if(! best || result.index > best.index) {
					best = result;
				}
			}

			let data = best ? best.data : null;
			if(data && this._mapper) {
				data = this._mapper(data, encounter);
			}
			return data;
		});
	}

	match(encounter, options) {
		if(typeof encounter === 'string') {
			encounter = new Encounter(this.language, encounter, options || {});
			encounter.outgoing = this.outgoing;

			if(this._skipPunctuation) {
				encounter.skipPunctuation = true;
			}

			if(this._fuzzy) {
				encounter.fuzzy = true;
			}
		}

		if(! encounter) {
			throw new Error('Nothing to match on');
		}

		let promise = encounter.next(0, 0);
		if(this._finalizer) {
			promise = promise.then(results => {
				return this._finalizer(results, encounter);
			});
		}

		return promise;
	}

	toString() {
		return 'Parser[]';
	}

	static result(node, validator) {
		if(typeof validator === 'undefined') {
			validator = node;
			node = null;
		}

		return function(parser) {
			const sub = new SubNode(node ? node : parser.outgoing, validator);
			if(validator) {
				sub.name = (node ? node.name + ':' : '') + validator.name;
			}
			return sub;
		};
	}

	static custom(validator) {
		return function() {
			return new CustomNode(validator);
		};
	}
}

module.exports = Parser;
