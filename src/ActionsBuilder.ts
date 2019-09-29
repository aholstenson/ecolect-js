import { IntentsBuilder } from './IntentsBuilder';
import { Language } from './language/Language';
import { Value } from './values/base';
import { Matcher, EncounterOptions } from './graph/matching';
import { ResolvedIntent } from './resolver/ResolvedIntent';
import { ResolvedIntents } from './resolver/ResolvedIntents';

export type Action<Values extends object> = (item: ResolvedIntent<Values>) => void;

export class ActionsBuilder {
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

	public action(id?: string): ActionBuilder<{}> {
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
		return new Actions(this.language, this.builder.build(), this.handlers);
	}
}

export interface ActionBuilder<Values extends object> {
	value<I extends string, V>(id: I, type: Value<V>): ActionBuilder<Values & { [K in I]: V }>;

	add(...args: string[]): this;

	handler(func: Action<Values>): this;

	done(): ActionsBuilder;
}

export class Actions {
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

	public match(expression: string, options: EncounterOptions): Promise<ResolvedActions> {
		const map = (item: ResolvedIntent<any>): ResolvedAction => {
			const result = item as any;
			result.activate = (...args: any[]) => {
				const handler = this.handlers.get(item.intent);
				const r = handler(item, ...args);
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

export interface ResolvedAction extends ResolvedIntent<any> {
	activate: () => void;
}

export interface ResolvedActions {
	best: ResolvedAction | null;
	matches: ResolvedAction[];
}
