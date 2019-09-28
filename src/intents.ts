import { ResolverBuilder } from './resolver/builder';
import { Language } from './language/language';
import { NodeConvertable, LanguageSpecificValue } from './values/base';

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
			value(id: string, type: LanguageSpecificValue | NodeConvertable) {
				instance.value(id, type);
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

	public build() {
		return this.builder.build();
	}
}

export interface IntentBuilder {
	value(id: string, type: LanguageSpecificValue | NodeConvertable): this;

	add(...args: string[]): this;

	done(): IntentsBuilder;
}
