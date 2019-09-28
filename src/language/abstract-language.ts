import { Language } from './language';
import { Tokens, Token } from './tokens';
import { ValueMatcherFactory } from './value-matcher-factory';
import { Matcher } from '../graph/matching';
import { GraphBuilder } from '../graph/builder';

export abstract class AbstractLanguage implements Language {
	private cachedMatchers: Map<string, Matcher<any>> = new Map();

	public abstract readonly id: string;

	public abstract tokenize(input: string): Tokens;

	public abstract compareTokens(a: Token, b: Token): number;

	public abstract comparePartialTokens(a: Token, b: Token): number;

	public abstract repeating<V>(matcher: Matcher<V>): GraphBuilder<V[]>;

	public matcher<V>(factory: ValueMatcherFactory<V>): Matcher<V | null> {
		const result = this.cachedMatchers.get(factory.id);
		if(result) {
			return result;
		}

		const created = factory.create(this);
		this.cachedMatchers.set(factory.id, created);
		return created;
	}

	public findMatcher<V>(id: string): Matcher<V> | null {
		return this.cachedMatchers.get(id) || null;
	}

	public getMatcher<V>(id: string): Matcher<V> {
		const result = this.cachedMatchers.get(id);
		if(! result) {
			throw new Error('No matcher with id `' + id + '` available');
		}

		return result;
	}
}
