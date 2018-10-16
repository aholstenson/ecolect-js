'use strict';

const Node = require('./node');
const RegExpNode = require('./regexp');
const TokenNode = require('./token');
const SubNode = require('./sub');
const CollectorNode = require('./collector');
const CustomNode = require('./custom');

const Matcher = require('./matching/matcher');

/**
 * Builder for a graph. This class is used to build matchers that can later
 * be used within the graph or standalone to match expressions.
 *
 */
module.exports = class Builder extends Node {
	constructor(language) {
		super();

		this.language = language;

		this.supportsPartial = false;
		this._skipPunctuation = false;
		this._fuzzy = false;
	}

	/**
	 * Set the name of the graph being built.
	 *
	 * @param {string} name
	 *   the name of the graph
	 * @return
	 *   self
	 */
	name(name) {
		this._name = this.language.id + ':' + name;
		return this;
	}

	/**
	 * Indicate that this graph supports partial matching.
	 *
	 * @return
	 *   self
	 */
	allowPartial() {
		this.supportsPartial = true;
		return this;
	}

	/**
	 * Allow the graph to skip punctuation during matching.
	 *
	 * @return
	 *   self
	 */
	skipPunctuation() {
		this._skipPunctuation = true;
		return this;
	}

	/**
	 * Allow the graph to perform fuzzy matching.
	 *
	 * @return
	 *   self
	 */
	fuzzy() {
		this._fuzzy = true;
		return this;
	}

	/**
	 * Add some nodes and the value to record if all nodes match. `nodes` can
	 * either be a single node/expression or an array of nodes and expressions.
	 *
	 * Examples:
	 * * `add('Hello', 1)` will match against `Hello` and output `1`
	 * *
	 *   `add([ Builder.result(), 'World' ])` will match recursively against
	 *    itself and then the token `World`.
	 * * `add([ /[0-9]+/ ])` will match against the given regular expression
	 *
	 * @param {Array|Node} nodes
	 * @param {*} value
	 */
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
			} else if(n instanceof Matcher) {
				return push(new SubNode(n));
			} else if(n instanceof Node) {
				return push(n);
			} else if(typeof n === 'string') {
				return push(this.parse(n));
			} else {
				throw new Error('Invalid node');
			}
		};

		for(const n of nodes) {
			let r = createNode(n);
			if(r && ! (r instanceof TokenNode)) {
				values++;
			}
		}

		push(new CollectorNode(values, value));

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
		Object.keys(values).forEach(k => this.add(k, () => func(values[k])));

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
			};
		} else {
			this._finalizer = func;
		}
		return this;
	}

	onlyBest() {
		return this.finalizer((results, encounter) => {
			let data = results[0] ? results[0].data : null;
			if(data && this._mapper) {
				data = this._mapper(data, encounter);
			}
			return data;
		});
	}

	toMatcher() {
		return this.createMatcher(this.language, this.outgoing, {
			name: this._name,
			fuzzy: this._fuzzy,
			supportsPartial: this.supportsPartial,
			skipPunctuation: this._skipPunctuation,
			mapper: this._mapper,
			finalizer: this._finalizer
		});
	}

	createMatcher(lang, nodes, options) {
		return new Matcher(lang, nodes, options);
	}

	static result(node, validator) {
		if(typeof validator === 'undefined') {
			validator = node;
			node = null;
		}

		return function(builder) {
			const sub = new SubNode(node ? node : builder.outgoing, validator);
			if(validator) {
				let name = node && node.name;
				if(typeof name === 'function') {
					name = node._name;
				}

				if(validator.name) {
					if(name) {
						name += ' - ' + validator.name;
					} else {
						name = validator.name;
					}
				}
				sub.name = name;
			} else {
				sub.name = builder._name + ':self';
			}
			return sub;
		};
	}

	static custom(validator) {
		return function() {
			return new CustomNode(validator);
		};
	}
};
