import { ResolverBuilder } from './resolver/ResolverBuilder';
import { Language } from './language/Language';
import { Value } from './values/base';
import { Matcher } from './graph/matching';
import { ResolvedIntents } from './resolver/ResolvedIntents';

export class IntentsBuilder {
	private language: Language;
	private builder: ResolverBuilder;

	constructor(language: Language) {
		if(! language || ! language.tokenize || ! language.compareTokens) {
			throw new Error('Language instance must be provided');
		}

		this.language = language;

		this.builder = new ResolverBuilder(this.language);
	}

	public intent(id: string): IntentBuilder {
		if(typeof id !== 'string') {
			throw new Error('Intents require identifiers that are strings');
		}

		const self = this;
		const instance = new ResolverBuilder(this.language, id);
		return {
			value(valueId: string, type: Value<any>) {
				instance.value(valueId, type);
				return this;
			},

			add(...args: string[]) {
				instance.add(...args);
				return this;
			},

			done() {
				self.builder.add(instance.build());
				return self;
			}
		};
	}

	public build(): Matcher<ResolvedIntents<any>> {
		return this.builder.toMatcher();
	}
}

export interface IntentBuilder {
	value(id: string, type: Value<any>): this;

	add(...args: string[]): this;

	done(): IntentsBuilder;
}
