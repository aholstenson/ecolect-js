import { GraphBuilder, GraphMatcher } from '@ecolect/graph';
import { Language } from '@ecolect/language';

import { Matcher } from './matching';
import { Phrase } from './resolver/Phrase';
import { Phrases } from './resolver/Phrases';

export type ActionInvoker<Context, ReturnType, Values extends object> = (item: Phrase<Values>, context: Context) => ReturnType;

/**
 * Definition of an action. Used as input when adding actions.
 */
export interface ActionDef<Context, ReturnType, Values extends object> {
	id: string;

	phrases: Phrases<Values>;

	handler: ActionInvoker<Context, ReturnType, Values>;
}

export class ActionsBuilder<Context=void, ReturnType=void> {
	private language: Language;
	private builder: GraphBuilder<Action<any, any, any>>;

	public constructor(language: Language) {
		if(! language) {
			throw new Error('Language instance must be provided');
		}

		this.language = language;

		this.builder = new GraphBuilder<Action<any, any, any>>(language)
			.allowPartial();
	}

	public add<V extends object>(def: ActionDef<Context, ReturnType, V>) {
		this.builder.add(
			def.phrases.toGraph(this.language),
			v => new Action(def.id, def.handler, v[0])
		);

		return this;
	}

	public build(): Matcher<Action<Context, ReturnType, any>> {
		const graph = this.builder.build();
		return new GraphMatcher(graph, {
			mapper: m => {
				m.data.refreshExpression();
				return m.data;
			}
		}) as any;
	}
}

export class Action<Context, ReturnType, Values extends object> extends Phrase<Values> {
	public readonly id: string;
	private readonly handler: ActionInvoker<Context, ReturnType, Values>;

	public constructor(
		id: string,
		handler: ActionInvoker<Context, ReturnType, Values>,
		phrase: Phrase<Values>
	) {
		super();

		this.id = id;
		this.handler = handler;

		this.score = phrase.score;
		this.expression = phrase.expression;
		this.values = phrase.values;
	}

	public activate(context: Context): ReturnType {
		return this.handler(this, context);
	}
}
