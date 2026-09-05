import { Token } from '../tokenization/index.js';

/**
 * Part of a template that is text taken from the phrase it was read from.
 */
export interface TemplateTextPart {
	readonly type: 'text';

	/**
	 * The tokens of the text, in the order they are written.
	 */
	readonly tokens: readonly Token[];
}

/**
 * Part of a template where a value is written.
 */
export interface TemplateValuePart {
	readonly type: 'value';

	/**
	 * The identifier of the value.
	 */
	readonly id: string;
}

/**
 * Part within a template, either text or a place where a value is written.
 */
export type TemplatePart = TemplateTextPart | TemplateValuePart;

/**
 * One of the ways a phrase can be written, as it is read back out of the
 * graph that matches it. A template is the text of the phrase together with
 * the places where its values go, so `Orders in {when}` becomes the text
 * `Orders in` followed by the value `when`.
 */
export interface Template {
	/**
	 * The parts of the template, in the order they are written.
	 */
	readonly parts: readonly TemplatePart[];

	/**
	 * The identifiers of the values this template writes, in the order they
	 * are written.
	 */
	readonly values: readonly string[];

	/**
	 * The number of words in the text of this template. Templates with fewer
	 * words are used first, so that the shortest way to say something is the
	 * one that gets generated.
	 */
	readonly words: number;
}
