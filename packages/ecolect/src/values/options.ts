import { GraphBuilder } from '@ecolect/graph';

import { PhrasesBuilder } from '../resolver/PhrasesBuilder';

import { LanguageSpecificValue, ParsingValue, Value } from './base';
import { ExpressionPart } from '../resolver/expression/ExpressionPart';
import { Phrases } from '../resolver/Phrases';

export interface OptionBuilderOptions {
	name?: string;
}

export interface OptionDef<Id extends string, Values extends object> {
	id: Id;
	phrases: Phrases<Values>;
}

export class OptionsBuilder<CurrentOptions extends object> {
	private name: string;
	private options: OptionBuilderOptions;
	private defs: OptionDef<any, any>[];

	public constructor(options: OptionBuilderOptions) {
		this.name = options.name || 'options';
		this.options = options;
		this.defs = [];
	}

	public add<Id extends string, Values extends object>(options: OptionDef<Id, Values>): OptionsBuilder<CurrentOptions & { [K in Id]: Values }> {
		this.defs.push(options);
		return this as any;
	}

	public build() {
		return new LanguageSpecificValue(language => {
			const parent = new GraphBuilder<Option<any>>(language)
				.name(this.name)
				.allowPartial();

			for(const def of this.defs) {
				parent.add(def.phrases.toGraph(language), v => {
					return new Option(def.id, v[0].values, v[0].expression);
				});
			}

			const graph = parent.build();

			const repeating = language.repeating(graph).build();

			return new ParsingValue(repeating, {
				mapper: value => {
					return new OptionsSet<CurrentOptions>(value);
				},
				...this.options
			});
		});
	}
}

export function optionsValue(options: OptionBuilderOptions={}) {
	return new OptionsBuilder<object>(options);
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

export class OptionsSet<OptionTypes extends object> implements Options<OptionTypes> {
	private readonly matches: Option<any>[];

	public constructor(matches: Option<any>[]) {
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

	public constructor(option: string, values: Values, expression: ExpressionPart[]) {
		this.option = option;
		this.values = values;

		Object.defineProperty(this, 'expression', {
			enumerable: false,
			writable: true
		});

		this.expression = expression;
	}
}
