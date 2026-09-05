import { Graph } from '../graph/index.js';

import { Language } from './Language.js';

/**
 * Factory that creates a graph tied to a certain language.
 */
export interface LanguageGraphFactory<DataType> {
	/**
	 * Unique identifier of the graph.
	 */
	readonly id: string;

	/**
	 * Create an instance of this graph.
	 *
	 * @param language
	 *   language to construct graph for
	 */
	create(language: Language): Graph<DataType>;
}
