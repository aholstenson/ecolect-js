import { Tokenizer, TokenComparer } from '@ecolect/tokenization';

import { CollectorNode, Collectable } from './CollectorNode.js';
import { CustomNode, TokenValidator } from './CustomNode.js';
import { Graph } from './Graph.js';
import { GraphOptions } from './GraphOptions.js';
import { MatchIsEqual } from './matching/index.js';
import { Node } from './Node.js';
import { Predicate } from './Predicate.js';
import { RegExpNode } from './RegExpNode.js';
import { SubNode } from './SubNode.js';
import { TokenNode } from './TokenNode.js';

/**
 * Object that can be mapped into another one.
 */
export interface MappableObject<V> {
	[x: string]: V;
}

export type GraphBuildable<V> = string | RegExp | Node | Graph<any> | ((builder: GraphBuilder<any>) => Node);

export type GraphBuildableArray<V> = GraphBuildable<V> | GraphBuildable<V>[];

export interface GraphTokens {
	tokenizer: Tokenizer;
	tokenComparer: TokenComparer;
}

/**
 * Builder for a graph. This class is used to build matchers that can later
 * be used within the graph or standalone to match expressions.
 *
 */
export class GraphBuilder<V> {
	protected readonly tokenizer: Tokenizer;
	protected readonly tokenComparer: TokenComparer;

	private nodes: Node[];
	protected options: GraphOptions;

	public constructor(opts: GraphTokens) {
		this.tokenizer = opts.tokenizer;
		this.tokenComparer = opts.tokenComparer;

		this.nodes = [];

		this.options = {
			supportsPartial: false,
			skipPunctuation: false,
			supportsFuzzy: false
		};
	}

	/**
	 * Set the name of the graph being built.
	 *
	 * @param {string} name
	 *   the name of the graph
	 * @returns
	 *   self
	 */
	public name(name: string): this {
		this.options.name = name;
		return this;
	}

	/**
	 * Indicate that this graph supports partial matching.
	 *
	 * @returns
	 *   self
	 */
	public allowPartial(active=true): this {
		this.options.supportsPartial = active;
		return this;
	}

	/**
	 * Allow the graph to skip punctuation during matching.
	 *
	 * @returns
	 *   self
	 */
	public skipPunctuation(active=true): this {
		this.options.skipPunctuation = active;
		return this;
	}

	/**
	 * Allow the given words to be left out while this graph is matched. The
	 * words are only skippable within this graph, so a graph that is used
	 * within another graph keeps its own words.
	 *
	 * Skipping requires fuzzy matching, so this only has an effect on graphs
	 * built with {@link supportsFuzzy}.
	 *
	 * @param words -
	 *   the words that may be left out, each of which may contain several
	 *   tokens
	 * @returns
	 *   self
	 */
	public skippable(...words: string[]): this {
		const tokens = new Set(this.options.skippableTokens);
		for(const word of words) {
			for(const token of this.tokenizer(word)) {
				tokens.add(token.normalized);
			}
		}

		this.options.skippableTokens = tokens;
		return this;
	}

	/**
	 * Set how the graph decides that two matches are the same. Matches that
	 * are equal are duplicates, and only the one with the best score is kept.
	 *
	 * @param func -
	 *   function that creates the equality check for the options an expression
	 *   is matched with
	 * @returns
	 *   self
	 */
	public matchIsEqual(func: MatchIsEqual): this {
		this.options.matchIsEqual = func;
		return this;
	}

	/**
	 * Allow the graph to perform fuzzy matching.
	 *
	 * @returns
	 *   self
	 */
	public supportsFuzzy(active=true): this {
		this.options.supportsFuzzy = active;
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
	public add(nodes: GraphBuildableArray<V>, value: Collectable<V>): this {
		if(! Array.isArray(nodes)) {
			nodes = [ nodes ];
		}

		let values = 0;
		let last: Node[] = this.nodes;
		const push = (node: Node) => {
			if(! (node instanceof Node)) {
				throw new Error('Not a node: ' + node);
			}

			/**
			 * Check if we can attach to an existing node or if we need to
			 * create a new branch.
			 */
			for(let i=0; i<last.length; i++) {
				if(last[i].equals(node)) {
					last = last[i].outgoing;
					mergeOutgoing(node.outgoing);
					return node;
				}
			}

			last.push(node);
			last = node.outgoing;

			// TODO: This needs to handle multiple nodes and multiple outgoing
			mergeOutgoing(last);

			return node;
		};

		const mergeOutgoing = (subNodes: Node[]) => {
			// TODO: This needs to handle multiple nodes and multiple outgoing
			if(subNodes.length === 1) {
				push(subNodes[0]);
			} else if(subNodes.length > 1) {
				throw new Error('Too many outgoing nodes, branching is not supported yet');
			}
		};

		const createNode = (n: GraphBuildable<V>) => {
			if(typeof n === 'function') {
				const result = n(this);
				return push(result);
			} else if(n instanceof RegExp) {
				return push(new RegExpNode(n));
			} else if(n instanceof Node) {
				return push(n);
			} else if(typeof n === 'string') {
				return push(this.parse(n));
			} else if('nodes' in n) {
				return push(new SubNode(n, n.options));
			} else {
				throw new Error('Invalid node');
			}
		};

		for(const n of nodes) {
			const r = createNode(n);
			if(r && ! (r instanceof TokenNode)) {
				values++;
			}
		}

		push(new CollectorNode(values, value));

		return this;
	}

	protected parse(text: string): Node {
		let first;
		let last: Node;
		this.tokenizer(text).forEach(t => {
			const node = new TokenNode(this.tokenComparer, t);
			if(last) {
				last.outgoing.push(node);
			} else {
				first = node;
			}
			last = node;
		});

		if(! first) {
			throw new Error('Could not parse data into nodes');
		}

		return first;
	}

	public map<D>(values: MappableObject<D>, func: (value: D) => V | null) {
		for(const key of Object.keys(values)) {
			const value = values[key];
			this.add(key, () => func(value));
		}

		return this;
	}

	public build(): Graph<V> {
		return {
			tokenizer: this.tokenizer,
			nodes: this.nodes,
			options: this.options
		};
	}

	public static result<V>(graph?: Graph<any> | Predicate<V>, validator?: Predicate<V>): (builder: GraphBuilder<V>) => Node {
		if(typeof validator === 'undefined') {
			if(typeof graph === 'function') {
				validator = graph;
				graph = undefined;
			} else if(graph) {
				throw new Error('Expected graph or a validation function, got ' + graph);
			}
		}

		if(graph && ! ('nodes' in graph)) {
			throw new Error('Given graph is not valid');
		}

		return function(builder: GraphBuilder<V>) {
			const sub = graph && 'nodes' in graph
				? new SubNode(graph, graph.options, validator)
				: new SubNode(builder.nodes, builder.options as any, validator);

			sub.recursive = ! graph;

			if(validator) {
				let name = (graph && 'nodes' in graph) ? graph.options.name : builder.options.name;
				if(validator.name) {
					if(name) {
						name += ':' + validator.name;
					} else {
						name = validator.name;
					}
				}
				sub.name = name || 'unknown';
			} else if(! graph) {
				sub.name = builder.options.name + ':self';
			}

			return sub;
		};
	}

	public static custom(validator: TokenValidator) {
		return function() {
			return new CustomNode(validator);
		};
	}
}
