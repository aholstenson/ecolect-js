import GraphBuilder from '../graph/builder';
import { LanguageSpecificValue, ParsingValue } from './base';
import ResolverBuilder from '../resolver/builder';

class Builder {
	constructor(options) {
		this.name = options.name;
		this.options = options;
		this.data = {};
	}

	option(id) {
		if(typeof id !== 'string') {
			throw new Error('Options require identifiers that are strings');
		}

		const result = {
			values: {},
			phrases: []
		};

		const self = this;
		return {
			value(id, type) {
				result.values[id] = type;
				return this;
			},

			add(...args) {
				result.phrases.push(args);
				return this;
			},

			done() {
				self.data[id] = result;
				return self;
			}
		};
	}

	build() {
		return new LanguageSpecificValue(language => {
			const parent = new GraphBuilder(language)
				.name(this.name || 'options')
				.allowPartial();

			for(const id of Object.keys(this.data)) {
				const option = this.data[id];
				const instance = new ResolverBuilder(language, id);

				// Set the name of the parser - for easier debugging
				instance.parser.options.name = parent.options.name + '[' + id + ']';

				// Transfer all of the values
				for(const valueKey of Object.keys(option.values)) {
					instance.value(valueKey, option.values[valueKey]);
				}

				// Transfer the phrases
				for(const phrase of option.phrases) {
					instance.add(...phrase);
				}

				const parser = instance.build();
				parent.add(parser, v => v[0]);
			}

			parent.mapResults(v => ({
				option: v.intent,
				values: v.values,
				expression: v.expression
			}));

			const repeating = language.repeating(parent.toMatcher())
				.onlyBest()
				.toMatcher();

			return new ParsingValue(repeating, Object.assign({
				supportsPartial: true
			}, this.options));
		});
	}
}

export default function(options={}) {
	return new Builder(options);
}
