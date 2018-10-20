import Node from './node';
import RegExpNode from './regexp';
import TokenNode from './token';
import SubNode from './sub';
import CollectorNode from './collector';
import CustomNode from './custom';

import Matcher from './matching/matcher';

/**
 * Builder for a graph. This class is used to build matchers that can later
 * be used within the graph or standalone to match expressions.
 *
 */
export default class GraphBuilder extends Node {
	constructor(language) {
		super();

		this.language = language;

		this.options = {
			supportsPartial: false,
			skipPunctuation: false,
			fuzzy: false
		};
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
		this.options.name = this.language.id + ':' + name;
		return this;
	}

	/**
	 * Indicate that this graph supports partial matching.
	 *
	 * @return
	 *   self
	 */
	allowPartial(active=true) {
		this.options.supportsPartial = active;
		return this;
	}

	/**
	 * Allow the graph to skip punctuation during matching.
	 *
	 * @return
	 *   self
	 */
	skipPunctuation(active=true) {
		this.options.skipPunctuation = active;
		return this;
	}

	/**
	 * Allow the graph to perform fuzzy matching.
	 *
	 * @return
	 *   self
	 */
	fuzzy(active=true) {
		this.options.active = active;
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
				return push(new SubNode(n, n.options));
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
		this.options.mapper = mapper;

		return this;
	}

	finalizer(func) {
		if(this.options.finalizer) {
			// Chain finalizer if several are requested
			const previous = this.options.finalizer;
			this.options.finalizer = function(results, encounter) {
				return func(previous(results, encounter));
			};
		} else {
			this.options.finalizer = func;
		}
		return this;
	}

	onlyBest() {
		return this.finalizer((results, encounter) => {
			let data = results[0] ? results[0].data : null;
			if(data && this.options.mapper) {
				data = this.options.mapper(data, encounter);
			}
			return data;
		});
	}

	/**
	 * Build this graph and turn it into a matcher.
	 */
	toMatcher() {
		return this.createMatcher(this.language, this.outgoing, this.options);
	}

	createMatcher(lang, nodes, options) {
		return new Matcher(lang, nodes, options);
	}

	static result(matcher, validator) {
		if(typeof validator === 'undefined') {
			if(typeof matcher === 'function') {
				validator = matcher;
				matcher = null;
			} else if(matcher) {
				throw new Error('Expected graph or a validation function, got ' + matcher);
			}
		}

		if(matcher && ! (matcher instanceof Matcher)) {
			throw new Error('matcher is not actually an instance of Matcher');
		}

		return function(builder) {
			const sub = matcher
				? new SubNode(matcher, matcher.options, validator)
				: new SubNode(builder.outgoing, builder.options, validator);

			sub.recursive = ! matcher;

			if(validator) {
				let name = matcher ? matcher.options.name : builder.options.name;
				if(validator.name) {
					if(name) {
						name += ':' + validator.name;
					} else {
						name = validator.name;
					}
				}
				sub.name = name;
			} else if(! matcher) {
				sub.name = builder.options.name + ':self';
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
