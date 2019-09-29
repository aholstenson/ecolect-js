import { Matcher } from '../graph/matching/Matcher';
import { ResolverParser }  from './ResolverParser';
import { ResolvedIntent } from './ResolvedIntent';
import { Language } from '../language/Language';
import { LanguageSpecificValue, NodeConvertable } from '../values/base';
import { Collectable } from '../graph/CollectorNode';
import { Match, DefaultMatcher } from '../graph/matching';
import { ResolvedIntents } from './ResolvedIntents';
import { GraphBuildable } from '../graph/GraphBuilder';

/**
 * This is a basic naive builder for instances of Resolver on top of the
 * parser.
 */
export class ResolverBuilder {
	private language: Language;
	private id: string;

	private parser: ResolverParser<ResolvedIntent>;
	private resultHandler: Collectable<ResolvedIntent>;

	constructor(language: Language, id?: string) {
		this.language = language;

		this.parser = new ResolverParser(language);
		this.id = id || 'unknown';

		this.resultHandler = (values, encounter) => {
			const result = new ResolvedIntent(this.id);

			// Transfer any values that have been pushed by other parsers
			const data = encounter.data();
			for(let i=0; i<data.length; i++) {
				const value = data[i];
				if(value.id && typeof value.value !== 'undefined') {
					result.values.set(value.id, value.value);
				}
			}

			// TODO: Only build expression if match is accepted

			// Build information about the matching expression
			result.updateExpression(encounter);

			return result;
		};
	}

	public value(id: string, type: LanguageSpecificValue<any> | NodeConvertable) {
		this.parser.value(id, type);
		return this;
	}

	public add(...args: GraphBuildable<any>[]) {
		if(args[0] instanceof DefaultMatcher) {
			/**
			 * If adding another parser for resolving intent just copy all
			 * of its nodes as they should work just fine with our own parser.
			 *
			 * TODO: Maybe use add instead to use optimization?
			 */
			args[0].nodes.forEach(r => (this.parser as any).nodes.push(r));
			return this;
		}

		this.parser.add(args, this.resultHandler);

		return this;
	}

	public build(): Matcher<ResolvedIntents> {
		return this.parser.reducer(({ results }) => {
			// Reduce the results down to our intended structure
			const actualResults = results.toArray()
				.map(finalizeIntent);

			return {
				best: actualResults[0] || null,
				matches: actualResults
			};
		}).toMatcher();
	}
}

function finalizeIntent(result: Match<ResolvedIntent>): ResolvedIntent {
	result.data.score = result.score;
	result.data.refreshExpression();
	return result.data;
}
