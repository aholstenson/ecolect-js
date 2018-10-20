import Encounter from './encounter';

/**
 * Matcher that can match expressions against a graph.
 */
export default class Matcher {
	constructor(language, nodes, options={}) {
		this.language = language;
		this.nodes = nodes;

		this.options = options;
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
		}, this.options, options));
		encounter.outgoing = this.nodes;

		let promise = encounter.next(0, 0)
			.then(() => {
				return encounter.matches.toArray();
			});

		if(this.options.finalizer) {
			promise = promise.then(results => this.options.finalizer(results, encounter));
		}

		return promise;
	}
}
