import { deepEqual } from 'fast-equals';

import { Graph } from './Graph.js';
import { GraphOptions } from './GraphOptions.js';
import {
	Encounter,
	Match,
	MaybePromise,
	NO_SKIPPABLE_TOKENS,
	SubGraphVariant,
	after,
	sequence
} from './matching/index.js';
import { Node } from './Node.js';
import { Predicate } from './Predicate.js';

/*
 * Small penalty applied when a SubNode matches. This helps the algorithm
 * prefer less parser matches. So if a parser P1 can match (A | A B) and
 * another one P1 matches (B) this penalty helps cases where P1 is followed
 * by an optional P2 to match P1 before before P1 P2.
 */
const PARSER_PENALTY = 0.001;

const alwaysTrue: Predicate<any> = () => true;

/**
 * Node that points to a sub-graph that should be evaluated as part of another
 * graph. This type of node will resolve all variants it can starting from the
 * current token working forwards.
 *
 * Given the tokens `T1 T2 T3 T4 T5 T6` and a match starting at T2 this node
 * may return with variants that span `T2` and `T2 T3` in which case the next
 * nodes will be evaluated both against both matches, so it will be invoked
 * once starting from `T3` and once from `T4`.
 *
 * The variants a sub-graph resolves are cached per encounter and token index,
 * so a graph that is used by several nodes is only evaluated once for a given
 * index. The cache holds the data as the sub-graph reported it, and every
 * node maps and filters that data on its own.
 */
export class SubNode<V> extends Node {
	private roots: Node[];

	public name: string;

	public recursive: boolean;
	public supportsPartial: boolean;
	private skipPunctuation: boolean;
	private supportsFuzzy: boolean;
	private skippableTokens: ReadonlySet<string>;

	private filter: Predicate<V>;
	public mapper: ((result: V, encounter: Encounter) => any) | undefined;

	/**
	 * Fallback value to apply in case this is a partial match and the graph
	 * doesn't fully match.
	 */
	public partialFallback?: any;

	public constructor(roots: Graph<V> | Node[], options: GraphOptions, filter?: Predicate<V>) {
		super();

		this.recursive = false;
		this.filter = filter ?? alwaysTrue;

		if('nodes' in roots) {
			// Roots is actually a graph, use its nodes directly
			this.roots = roots.nodes;
		} else {
			this.roots = roots;
		}

		this.supportsPartial = options.supportsPartial || false;
		this.name = options.name || 'unknown';
		this.skipPunctuation = options.skipPunctuation || false;
		this.supportsFuzzy = options.supportsFuzzy || false;
		this.skippableTokens = options.skippableTokens || NO_SKIPPABLE_TOKENS;
	}

	public match(encounter: Encounter) {
		if(! encounter.token() && encounter.isPartialInput) {
			if(this.recursive) {
				/**
				 * If this evaluating a recursive match on a partial encounter
				 * skip it.
				 */
				return;
			}

			if(! this.supportsPartial) {
				/**
				 * Partial match for nothing without support for it. Assume
				 * we will match in the future.
				 */
				return;
			}
		}

		const cache = encounter.cache();

		// Check if this node has already mapped the variants at this index
		const mapped = cache.get(this);
		if(mapped) {
			return this.branchIntoVariants(encounter, mapped);
		}

		// Check if the sub-graph has been evaluated at this index by another node
		const raw = cache.get(this.roots);
		if(raw) {
			return this.branchIntoVariants(encounter, this.mapVariants(encounter, raw, cache));
		}

		const evaluation = encounter.evaluationOf(this.roots);
		if(evaluation) {
			/*
			 * The sub-graph refers to itself, use the variants found so far
			 * as the seed. The evaluation in progress will run again if the
			 * seed grows, so the seed is not cached.
			 */
			encounter.useSeed(evaluation);
			return this.branchIntoVariants(encounter, this.mapVariants(encounter, evaluation.seed));
		}

		return after(this.evaluate(encounter), variants => {
			return this.branchIntoVariants(encounter, this.mapVariants(encounter, variants, cache));
		});
	}

	/**
	 * Evaluate the sub-graph at the current index of the encounter. The
	 * sub-graph is evaluated again as long as it referred to itself and found
	 * new variants, so that graphs that combine their own results can nest
	 * to any depth.
	 *
	 * @param encounter -
	 *   the encounter
	 * @returns
	 *   the variants found, via a promise if evaluation was asynchronous
	 */
	private evaluate(encounter: Encounter): MaybePromise<SubGraphVariant[]> {
		const evaluation = encounter.startEvaluating(this.roots);
		const baseScore = encounter.currentScore;

		// Memorize if we are running a partial match
		const supportsPartial = encounter.supportsPartial;
		const supportsFuzzy = encounter.supportsFuzzy;
		const skipPunctuation = encounter.skipPunctuation;
		const skippableTokens = encounter.skippableTokens;

		/*
		 * Every pass over the sub-graph must be able to consume at least one
		 * more token than the previous one, so the number of passes is bounded
		 * by the number of tokens left.
		 */
		let passesLeft = encounter.tokens.length - encounter.currentIndex + 2;

		const pass = (roots: Node[]): MaybePromise<SubGraphVariant[]> => {
			const found: SubGraphVariant[] = [];
			evaluation.seedUsed = false;
			evaluation.seedRoots.clear();

			const onMatch = (match: Match<V>) => {
				const data = match.data !== null && typeof match.data !== 'undefined'
					? match.data
					: null;

				/*
				 * The score of the match is used instead of the current score
				 * of the encounter. Nodes that resolve values report their
				 * matches after the encounter has been restored to where the
				 * value started, so the current score would leave out both
				 * the value and everything matched after it.
				 */
				const score = match.scoreData.score - baseScore;

				found.push({
					index: match.index,
					score: score,
					data: data
				});

				// Back-track to allow following nodes to also handle any trailing tokens
				const previousNonSkipped = encounter.previousNonSkipped(match.index);
				if(previousNonSkipped !== match.index) {
					found.push({
						index: previousNonSkipped,
						score: score,
						data: data
					});
				}
			};

			const branched = encounter.branchWithOnMatch(onMatch, () => {
				encounter.supportsPartial = this.supportsPartial;
				encounter.supportsFuzzy = this.supportsFuzzy;
				encounter.skipPunctuation = this.skipPunctuation;
				encounter.skippableTokens = this.skippableTokens;

				return encounter.branchInto(roots);
			});

			return after(branched, () => {
				// Switch back to previous supported values
				encounter.supportsPartial = supportsPartial;
				encounter.supportsFuzzy = supportsFuzzy;
				encounter.skipPunctuation = skipPunctuation;
				encounter.skippableTokens = skippableTokens;

				const grew = mergeVariants(evaluation.seed, found);
				if(grew && evaluation.seedUsed && --passesLeft > 0) {
					/*
					 * Only the roots that used the seed can find something
					 * new when the seed has grown, so only those are
					 * evaluated again.
					 */
					return pass(Array.from(evaluation.seedRoots));
				}

				return evaluation.seed;
			});
		};

		return after(pass(this.roots), variants => {
			encounter.stopEvaluating(evaluation);

			if(! evaluation.dependsOnSeed) {
				encounter.cache().set(this.roots, variants);
			}

			return variants;
		});
	}

	/**
	 * Map and filter the variants the sub-graph reported into the variants
	 * this node should branch into.
	 *
	 * @param encounter -
	 *   the encounter
	 * @param variants -
	 *   the variants as reported by the sub-graph
	 * @param cache -
	 *   cache to store the result in, if the result may be reused
	 * @returns
	 *   the variants to branch into
	 */
	private mapVariants(
		encounter: Encounter,
		variants: SubGraphVariant[],
		cache?: Map<any, any>
	): SubGraphVariant[] {
		const result: SubGraphVariant[] = [];
		for(const v of variants) {
			let data = v.data;
			if(data !== null) {
				if(this.mapper) {
					data = this.mapper(data, encounter);
				}

				if(! this.filter(data)) continue;
			}

			result.push({
				index: v.index,
				score: v.score,
				data: data
			});
		}

		if(cache) {
			cache.set(this, result);
		}

		return result;
	}

	/**
	 * Evaluate the nodes after this one for every variant.
	 *
	 * @param encounter -
	 *   the encounter
	 * @param variants -
	 *   the variants to branch into
	 * @returns
	 *   nothing, via a promise if evaluation was asynchronous
	 */
	private branchIntoVariants(encounter: Encounter, variants: SubGraphVariant[]): MaybePromise<void> {
		if(variants.length === 0) {
			if(encounter.isPartialInput && ! this.supportsPartial && this.partialFallback) {
				return encounter.advance(0.0, encounter.tokens.length - encounter.currentIndex, this.partialFallback);
			}

			return;
		}

		return sequence(variants.length, i => {
			const v = variants[i];
			return encounter.advance(
				v.score - PARSER_PENALTY,
				v.index - encounter.currentIndex,
				v.data
			);
		});
	}

	public equals(other: Node): boolean {
		function arrayEquals<E>(a: E[], b: E[]) {
			if(a.length !== b.length) return false;
			for(let i=0; i<a.length; i++) {
				if(a[i] !== b[i]) return false;
			}
			return true;
		}

		return other instanceof SubNode
			&& arrayEquals(this.roots, other.roots)
			&& this.filter === other.filter;
	}

	public toString() {
		return 'SubGraph[' + (this.name || this.roots) + ']';
	}

	public toDot() {
		if(this.name === 'Self') {
			return 'shape=circle, label=""';
		} else {
			return 'shape=rectangle, label="' + (this.name || '') + '"';
		}
	}
}

/**
 * Merge newly found variants into the seed of an evaluation. Variants that
 * end at the same index with equal data are the same variant, and only the
 * best score is kept for them.
 *
 * @param seed -
 *   the variants found so far, which is changed in place
 * @param found -
 *   the variants found during the latest pass
 * @returns
 *   true if the seed changed
 */
function mergeVariants(seed: SubGraphVariant[], found: SubGraphVariant[]): boolean {
	let changed = false;

	for(const candidate of found) {
		let existing: SubGraphVariant | undefined;
		for(const v of seed) {
			if(v.index === candidate.index && deepEqual(v.data, candidate.data)) {
				existing = v;
				break;
			}
		}

		if(existing) {
			if(candidate.score > existing.score) {
				existing.score = candidate.score;
				changed = true;
			}
		} else {
			seed.push(candidate);
			changed = true;
		}
	}

	return changed;
}
