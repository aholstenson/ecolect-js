import { GraphBuilder } from '../graph/GraphBuilder';
import { ResolverBuilder } from '../resolver/ResolverBuilder';

import { LanguageSpecificValue, ParsingValue, Value } from './base';
import { ResolvedIntent } from '../resolver/ResolvedIntent';
import { ExpressionPart } from '../resolver/expression/ExpressionPart';

export interface OptionBuilderOptions {
	name?: string;
}

export class OptionsBuilder<CurrentOptions extends object> {
	private name: string;
	private options: OptionBuilderOptions;
	private data: Record<string, OptionData>;

	constructor(options: OptionBuilderOptions) {
		this.name = options.name || 'options';
		this.options = options;
		this.data = {};
	}

	public option<Id extends string>(id: Id): OptionBuilder<CurrentOptions, Id, {}> {
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
				return this as any;
			},

			add(...args) {
				result.phrases.push(args);
				return this;
			},

			done() {
				self.data[id] = result;
				return self as any;
			}
		};
	}

	public build() {
		return new LanguageSpecificValue(language => {
			const parent = new GraphBuilder<ResolvedIntent<any>>(language)
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

			const graph = parent.build();

			const repeating = language.repeating(graph).build();

			return new ParsingValue(repeating, {
				mapper: value => {
					const allResults: Option<any>[] = [];
					for(const option of value) {
						allResults.push(new Option(option.intent, option.values, option.expression));
					}

					return new OptionsSet<CurrentOptions>(allResults);
				},
				...this.options
			});
		});
	}
}

export function optionsValue(options: OptionBuilderOptions={}) {
	return new OptionsBuilder<{}>(options);
}

export interface OptionBuilder<CurrentOptions, Key extends string, Values extends object> {
	value<I extends string, V>(id: I, type: Value<V>): OptionBuilder<CurrentOptions, Key, Values & { [K in I]: V }>;

	add(...args: string[]): this;

	done(): OptionsBuilder<CurrentOptions & { [K in Key]: Values }>;
}

interface OptionData {
	values: Record<string, Value<any>>;
	phrases: any[];
}

/**
 * Options interface, used to access options as they are found in the matched
 * expression.
 */
export interface Options<OptionTypes extends object> {
	/**
	 * Get the first option with the given id.
	 *
	 * @param option
	 *   the option to fetch
	 */
	get<Id extends keyof OptionTypes>(option: Id): Option<OptionTypes[Id]> | null;

	/**
	 * Get all options with the given id.
	 */
	getAll<Id extends keyof OptionTypes>(option: Id): Option<OptionTypes[Id]>[];

	/**
	 * Get all of the options as an array.
	 */
	toArray(): ReadonlyArray<Option<any>>;
}

class OptionsSet<OptionTypes extends object> implements Options<OptionTypes> {
	private readonly matches: Option<any>[];

	constructor(matches: Option<any>[]) {
		this.matches = matches;
	}

	public get<Id extends keyof OptionTypes>(option: Id): Option<OptionTypes[Id]> | null {
		for(const match of this.matches) {
			if(match.option === option) {
				return match as any;
			}
		}

		return null;
	}

	public getAll<Id extends keyof OptionTypes>(option: Id): Option<OptionTypes[Id]>[] {
		return this.matches.filter(match => match.option === option);
	}

	public toArray() {
		return this.matches;
	}
}

/**
 * Custom option value to hide enumeration for equality checks.
 */
export class Option<Values> {
	public readonly option: string;
	public readonly values: Values;
	public readonly expression: ExpressionPart[];

	constructor(option: string, values: Values, expression: ExpressionPart[]) {
		this.option = option;
		this.values = values;

		Object.defineProperty(this, 'expression', {
			enumerable: false,
			writable: true
		});

		this.expression = expression;
	}

}
