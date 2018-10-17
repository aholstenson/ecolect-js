import Encounter from './encounter';

/**
 * Matcher that can match expressions against a graph.
 */
export default class Matcher {
	constructor(language, nodes, options={}) {
		this.language = language;
		this.nodes = nodes;
		this.name = options.name;
		this.fuzzy = options.fuzzy || false;
		this.skipPunctuation = options.skipPunctuation || false;
		this.finalizer = options.finalizer || null;
		this.supportsPartial = options.supportsPartial || false;
		this.mapper = options.mapper || null;

		this._cache = {};
	}

	/**
	 * Match against the given expression.
	 *
	 * @param {string} expression
	 * @param {object} options
	 * @return {Promise}
	 */
	match(expression, options={}) {
		if(typeof expression !== 'string') {
			throw new Error('Can only match against string expressions');
		}

		const encounter = new Encounter(this.language, expression, Object.assign({
			onlyComplete: true
		}, options));
		encounter.outgoing = this.nodes;

		if(this.skipPunctuation) {
			encounter.skipPunctuation = true;
		}

		if(this.fuzzy) {
			encounter.fuzzy = true;
		}

		let promise = encounter.next(0, 0)
			.then(() => {
				return encounter.matches.toArray();
			});

		if(this.finalizer) {
			promise = promise.then(results => this.finalizer(results, encounter));
		}

		return promise;
	}
}
