import { Token } from '../tokenization/index.js';

import { Template } from './Template.js';

/**
 * How the words of a generated text are written.
 */
export type Casing =
	/**
	 * Keep the words as they are written in the phrase.
	 */
	'phrase'
	/**
	 * Write every word in lower case.
	 */
	| 'lower'
	/**
	 * Write every word in lower case, with the first letter of the text in
	 * upper case.
	 */
	| 'sentence';

/**
 * Punctuation that a space is written after, such as the comma in
 * `orders, please`. Other punctuation is written tight against the words
 * around it, so that a time stays `14:00`.
 */
const SPACE_AFTER = new Set([ ',', '.', '!', '?', ';' ]);

/**
 * Builder that writes words and punctuation into a text with the spaces a
 * reader expects.
 */
export class TextBuilder {
	private text: string;
	private previous: Token | null;

	public constructor() {
		this.text = '';
		this.previous = null;
	}

	/**
	 * Add a word or a piece of punctuation.
	 *
	 * @param token -
	 *   the token to add
	 * @param casing -
	 *   how to write the token
	 * @returns
	 *   self
	 */
	public addToken(token: Token, casing: Casing = 'phrase'): this {
		this.text += this.separator(token) + applyCasing(token.raw, casing);
		this.previous = token;
		return this;
	}

	/**
	 * Add text that has already been written, such as a value.
	 *
	 * @param text -
	 *   the text to add
	 * @returns
	 *   self
	 */
	public addText(text: string): this {
		if(text === '') return this;

		this.text += (this.text === '' ? '' : ' ') + text;
		this.previous = null;
		return this;
	}

	/**
	 * Get the text that has been written.
	 *
	 * @returns
	 *   the text
	 */
	public toString(): string {
		return this.text;
	}

	/**
	 * Get what to write before a token.
	 *
	 * @param token -
	 *   the token about to be written
	 * @returns
	 *   the separator, either a space or nothing
	 */
	private separator(token: Token): string {
		if(this.text === '') return '';
		if(token.punctuation) return '';
		if(this.previous?.punctuation && ! SPACE_AFTER.has(this.previous.raw)) return '';

		return ' ';
	}
}

/**
 * Write a word as the given casing asks for.
 *
 * @param text -
 *   the word
 * @param casing -
 *   how to write it
 * @returns
 *   the word as it should be written
 */
function applyCasing(text: string, casing: Casing): string {
	return casing === 'phrase' ? text : text.toLowerCase();
}

/**
 * Write the words of some tokens as a text.
 *
 * @param tokens -
 *   the tokens to write
 * @returns
 *   the text
 */
export function joinTokens(tokens: readonly Token[]): string {
	const builder = new TextBuilder();
	for(const token of tokens) {
		builder.addToken(token);
	}

	return builder.toString();
}

/**
 * Write a template as a text, using the given text for every value in it.
 *
 * @param template -
 *   the template to write
 * @param values -
 *   the text of each value, keyed by the identifier of the value
 * @param casing -
 *   how to write the words of the phrase
 * @returns
 *   the text
 */
export function joinTemplate(
	template: Template,
	values: ReadonlyMap<string, string>,
	casing: Casing = 'phrase'
): string {
	const builder = new TextBuilder();
	let startsWithText = false;

	for(const part of template.parts) {
		if(part.type === 'text') {
			if(builder.toString() === '') {
				startsWithText = true;
			}

			for(const token of part.tokens) {
				builder.addToken(token, casing);
			}
		} else {
			builder.addText(values.get(part.id) ?? '');
		}
	}

	const text = builder.toString();
	if(casing === 'sentence' && startsWithText && text !== '') {
		/*
		 * Only text of the phrase is changed, as a value may be something
		 * that should keep the case it was given, such as a name.
		 */
		return text[0].toUpperCase() + text.substring(1);
	}

	return text;
}
