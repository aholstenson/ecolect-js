import { IntentsBuilder } from './IntentsBuilder';
import { Language } from './language/Language';
import { Value } from './values/base';
import { Matcher, EncounterOptions } from './graph/matching';
import { ResolvedIntent } from './resolver/ResolvedIntent';
import { ResolvedIntents } from './resolver/ResolvedIntents';

export type Action = (item: ResolvedIntent) => void;

export class ActionsBuilder {
	private builder: IntentsBuilder;
	private handlers: Map<string, any>;
	private id: number;

	constructor(lang: Language) {
		this.builder = new IntentsBuilder(lang);
		this.handlers = new Map();
		this.id = 0;
	}

	public action(id?: string): ActionBuilder {
		// Auto assign an id
		const actualId = id ? id : id = ('__auto__' + ++this.id);

		const builder = this.builder.intent(id);

		const self = this;
		return {
			value(valueId, type) {
				builder.value(valueId, type);
				return this;
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
		return new Actions(this.builder.build(), this.handlers);
	}
}

export interface ActionBuilder {
	value(id: string, type: Value): this;

	add(...args: string[]): this;

	handler(func: Action): this;

	done(): ActionsBuilder;
}

export class Actions {
	private handlers: Map<string, any>;
	private matcher: Matcher<ResolvedIntents>;

	constructor(matcher: Matcher<ResolvedIntents>, handlers: Map<string, any>) {
		this.matcher = matcher;
		this.handlers = handlers;
	}

	get language() {
		return this.matcher.language;
	}

	public match(expression: string, options: EncounterOptions): Promise<ResolvedActions> {
		const map = (item: ResolvedIntent): ResolvedAction => {
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

export interface ResolvedAction extends ResolvedIntent {
	activate: () => void;
}

export interface ResolvedActions {
	best: ResolvedAction | null;
	matches: ResolvedAction[];
}
