import { Graph, GraphBuilder } from '@ecolect/graph';
import { AbstractLanguage } from '@ecolect/language';

import { createRepeating } from './repeating';
import { tokenComparer } from './tokenComparer';
import { tokenizer } from './tokenizer';

/*
 * Minimal implementation of English. Does not include any known graphs.
 */
export class MinimalEnglishLanguage extends AbstractLanguage {
	public readonly id = 'en';

	public constructor() {
		super(tokenizer, tokenComparer);
	}

	public repeating<V>(graph: Graph<V>): GraphBuilder<V[]> {
		return createRepeating<V>(this)(graph);
	}
}
