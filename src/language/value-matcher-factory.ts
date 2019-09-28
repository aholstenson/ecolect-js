import { Language } from './language';
import { Matcher } from '../graph/matching';

/**
 * Factory used to create matchers that can match against a specific value.
 */
export interface ValueMatcherFactory<V> {
	readonly id: string;

	create(language: Language): Matcher<V | null>;
}
