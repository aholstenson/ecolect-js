import { GraphBuilder } from '../graph/builder';
import { ResolverBuilder } from '../resolver/builder';

import { LanguageSpecificValue, ParsingValue, NodeConvertable } from './base';
import { ValueParserOptions } from '../resolver/value-parser';
import { ResolvedIntent } from '../resolver/resolved-intent';
import { ExpressionPart } from '../resolver/expression/ExpressionPart';

export interface OptionBuilderOptions extends ValueParserOptions {
	name?: string;
}

export class OptionsBuilder {
	private name: string;
	private options: ValueParserOptions;
	private data: Record<string, OptionData>;

	constructor(options: OptionBuilderOptions) {
		this.name = options.name || 'options';
		this.options = options;
		this.data = {};
	}

	public option(id: string): OptionBuilder {
		if(typeof id !== 'string') {
			throw new Error('Options require identifiers that are strings');
		}

		const result: OptionData = {
			values: {},
			phrases: []
		};

		const self = this;
		return {
			value(valueId, type) {
				result.values[valueId] = type;
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

	public build() {
		return new LanguageSpecificValue(language => {
			const parent = new GraphBuilder<ResolvedIntent>(language)
				.name(this.name)
				.allowPartial();

			for(const id of Object.keys(this.data)) {
				const option = this.data[id];
				const instance = new ResolverBuilder(language, id);

				// Set the name of the parser - for easier debugging
				//instance.parser.options.name = parent.options.name + '[' + id + ']';

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

			const matcher = parent.mapResults(v => new Option(v.intent, v.values, v.expression))
				.toMatcher();

			const repeating = language.repeating(matcher)
				.onlyBest()
				.toMatcher();

			return new ParsingValue(repeating, Object.assign({
				supportsPartial: true
			}, this.options));
		});
	}
}

export function optionsValue(options: OptionBuilderOptions={}) {
	return new OptionsBuilder(options);
}

export interface OptionBuilder {
	value(id: string, type: LanguageSpecificValue | NodeConvertable): this;

	add(...args: string[]): this;

	done(): OptionsBuilder;
}

interface OptionData {
	values: Record<string, LanguageSpecificValue | NodeConvertable>;
	phrases: any[];
}

/**
 * Custom option value to hide enumeration for equality checks.
 */
export class Option {
	public readonly option: string;
	public readonly values: Map<string, any>;
	public readonly expression: ExpressionPart[];

	constructor(option: string, values: Map<string, any>, expression: ExpressionPart[]) {
		this.option = option;
		this.values = values;

		Object.defineProperty(this, 'expression', {
			enumerable: false,
			writable: true
		});

		this.expression = expression;
	}

}
