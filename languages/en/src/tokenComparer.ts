import { TokenComparer } from '@ecolect/tokenization';

import { jaroWinklerSimilarity } from './algorithms/jaroWinkler.js';

export const tokenComparer: TokenComparer = {
	compare(a, b) {
		if(a.normalized === b.normalized) return 1.0;

		if(a.stemmed === b.stemmed) return 0.95;

		if(a.short || b.short) return 0;

		const d = jaroWinklerSimilarity(a.normalized, b.normalized);
		if(d > 0.9) return d * 0.9;

		return 0;
	},

	comparePartial(a, b) {
		if(a.normalized.indexOf(b.normalized) === 0) return 1.0;

		const d = jaroWinklerSimilarity(a.normalized.substring(0, b.normalized.length), b.normalized);
		if(d > 0.9) return d * 0.9;

		return 0;
	}
};
