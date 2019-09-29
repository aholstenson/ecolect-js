import { IntentsBuilder } from './IntentsBuilder';
import { Language } from './language/Language';
import { Value } from './values/base';
import { Matcher, EncounterOptions } from './graph/matching';
import { ResolvedIntent } from './resolver/ResolvedIntent';
import { ResolvedIntents } from './resolver/ResolvedIntents';

export type Action<Context, ReturnType, Values extends object> = (item: ResolvedIntent<Values>, context: Context) => Promise<ReturnType> | ReturnType;

export class ActionsBuilder<Context=void, ReturnType=void> {
	private language: Language;
	private builder: IntentsBuilder;
	private handlers: Map<string, any>;
	private id: number;

	constructor(lang: Language) {
		this.language = lang;
		this.builder = new IntentsBuilder(lang);
		this.handlers = new Map();
		this.id = 0;
	}

	public action(id?: string): ActionBuilder<Context, ReturnType, {}> {
		// Auto assign an id
		const actualId = id ? id : id = ('__auto__' + ++this.id);

		const builder = this.builder.intent(id);

		const self = this;
		return {
			value(valueId, type) {
				builder.value(valueId, type);
				return this as any;
			},

			add(...args) {
				builder.add(...args);
				return this;
			},

			handler(func) {
				self.handlers.set(actualId, func);
				return this;
			},

			done() {
				builder.done();
				return self;
			}
		};
	}

	public build() {
		return new Actions<Context, ReturnType>(this.language, this.builder.build(), this.handlers);
	}
}

export interface ActionBuilder<Context, ReturnType, Values extends object> {
	value<I extends string, V>(id: I, type: Value<V>): ActionBuilder<Context, ReturnType, Values & { [K in I]: V }>;

	add(...args: string[]): this;

	handler(func: Action<Context, ReturnType, Values>): this;

	done(): ActionsBuilder<Context, ReturnType>;
}

export class Actions<Context, ReturnType> {
	public readonly language: Language;
	private handlers: Map<string, any>;
	private matcher: Matcher<ResolvedIntents<any>>;

	constructor(
		language: Language,
		matcher: Matcher<ResolvedIntents<any>>,
		handlers: Map<string, any>
	) {
		this.language = language;
		this.matcher = matcher;
		this.handlers = handlers;
	}

	public match(expression: string, options?: EncounterOptions): Promise<ResolvedActions<Context, ReturnType>> {
		const map = (item: ResolvedIntent<any>): ResolvedAction<Context, ReturnType> => {
			const result = item as any;
			result.activate = (context: Context) => {
				const handler = this.handlers.get(item.intent);
				const r = handler(item, context);
				return Promise.resolve(r);
			};

			return result;
		};

		return this.matcher.match(expression, options)
			.then(result => {
				return {
					best: result.best ? map(result.best) : null,
					matches: result.matches.map(map)
				};
			});
	}
}

export interface ResolvedAction<Context, ReturnType> extends ResolvedIntent<any> {
	activate: (context: Context) => Promise<ReturnType>;
}

export interface ResolvedActions<Context, ReturnType> {
	best: ResolvedAction<Context, ReturnType> | null;
	matches: ResolvedAction<Context, ReturnType>[];
}
