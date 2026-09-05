import { Language } from '../language/index.js';
import { MatchOptions } from '../matching/index.js';

/**
 * What a renderer knows about the text it is writing.
 */
export interface RenderContext {
	/**
	 * The language the text is written in.
	 */
	readonly language: Language;

	/**
	 * The options the text will be read back with, such as the locale.
	 */
	readonly options: MatchOptions;

	/**
	 * The time the text is written at.
	 */
	readonly now: Date;
}

/**
 * Writes a value as text that the same value can be read back from.
 *
 * A renderer returns every way it can think of to write the value, best way
 * first, and does not have to be sure that any of them can be read back. The
 * generator reads each one back and keeps the first that resolves to the
 * value it started with, so a way of writing something that a language does
 * not understand is dropped instead of being handed to the caller.
 */
export interface ValueRenderer<V> {
	/**
	 * Write the given value as text.
	 *
	 * @param value -
	 *   the value to write
	 * @param context -
	 *   what is known about the text being written
	 * @returns
	 *   the ways the value can be written, best way first
	 */
	render(value: V, context: RenderContext): string[] | Promise<string[]>;
}

/**
 * Create a renderer from a function.
 *
 * @param render -
 *   the function that writes the value
 * @returns
 *   the renderer
 */
export function renderer<V>(
	render: (value: V, context: RenderContext) => string[] | Promise<string[]>
): ValueRenderer<V> {
	return { render: render };
}
