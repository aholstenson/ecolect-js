import { Language } from './Language';
import { Graph } from '../graph/Graph';

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
