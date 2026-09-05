import { deepEqual } from 'fast-equals';

import { GraphBuilder, GraphMatcher } from './graph/index.js';
import { Language } from './language/index.js';
import { localeAwareMatcher, Matcher } from './matching/index.js';
import { Phrase } from './resolver/Phrase.js';
import { Phrases } from './resolver/Phrases.js';

export type ActionInvoker<Context, ReturnType, Values extends object> = (item: Phrase<Values>, context: Context) => ReturnType;

/**
 * Definition of an action. Used as input when adding actions.
 */
export interface ActionDef<Context, ReturnType, Values extends object> {
	id: string;

	phrases: Phrases<Values>;

	handler: ActionInvoker<Context, ReturnType, Values>;
}

/**
 * Check if two actions are the same suggestion. Actions that have the same
 * identifier and the same values do the same thing when activated, even if
 * they matched different words, so only the best scoring one is kept.
 *
 * @param a -
 *   the first action
 * @param b -
 *   the second action
 * @returns
 *   `true` if the actions are the same suggestion
 */
function actionIsEqual(a: Action<any, any, any>, b: Action<any, any, any>): boolean {
	return a.id === b.id && deepEqual(a.values, b.values);
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
			.allowPartial()
			.matchIsEqual(options => options.all ? actionIsEqual : deepEqual);
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
		return localeAwareMatcher(this.language, new GraphMatcher(graph, {
			mapper: m => {
				m.data.score = m.score;
				m.data.refreshExpression();
				return m.data;
			}
		})) as any;
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
