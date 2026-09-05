import { GraphBuilder } from '../graph/index.js';

import { LanguageSpecificValue, ParsingValue } from './base.js';

const DEFAULT_MAPPER = <V>(v: V) => String(v);

/**
 * Value in an enumeration together with the text that matches it. Use this
 * form when a value can be said in more than one way.
 */
export interface EnumerationEntry<V> {
	/**
	 * The value to resolve to.
	 */
	value: V;

	/**
	 * The text that resolves to the value. Every text resolves to the same
	 * value, so `[ 'customers', 'clients' ]` matches both words.
	 */
	text: string | string[];
}

/**
 * Item in an enumeration, either the value itself or the value together with
 * the text that matches it.
 */
export type EnumerationItem<V> = V | EnumerationEntry<V>;

/**
 * Get if the given item carries its own text.
 *
 * @param item -
 *   the item to check
 * @returns
 *   `true` if the item is an entry
 */
function isEntry<V>(item: EnumerationItem<V>): item is EnumerationEntry<V> {
	if(typeof item !== 'object' || item === null) return false;
	if(! ('value' in item) || ! ('text' in item)) return false;

	return typeof item.text === 'string' || Array.isArray(item.text);
}

/**
 * Read the text of an item as a list of texts.
 *
 * @param text -
 *   the text, either a single one or several
 * @returns
 *   the texts that resolve to the value
 */
function toTexts(text: string | string[]): string[] {
	const texts = Array.isArray(text) ? text : [ text ];
	if(texts.length === 0) {
		throw new Error('Enumeration values need at least one text to match');
	}

	return texts;
}

/**
 * Create a value that resolves to one of the given items.
 *
 * Items are either values, in which case their text comes from `textMapper`,
 * or entries that carry their own text:
 *
 * ```javascript
 * enumerationValue([
 *   { value: 'customers', text: [ 'customers', 'clients', 'accounts' ] },
 *   'orders'
 * ]);
 * ```
 *
 * @param items -
 *   the items that may be matched
 * @param textMapper -
 *   how to read the text of items that are not entries, defaults to using
 *   the value as its own text. Return an array to match several texts
 * @returns
 *   value that resolves to one of the items
 */
export function enumerationValue<V>(
	items: readonly EnumerationItem<V>[],
	textMapper?: (value: V) => string | string[]
) {
	const mapper = textMapper ? textMapper : DEFAULT_MAPPER;

	return new LanguageSpecificValue(language => {
		let builder = new GraphBuilder<V>(language)
			.allowPartial();

		for(const item of items) {
			const value = isEntry(item) ? item.value : item;
			const texts = isEntry(item) ? toTexts(item.text) : toTexts(mapper(value));

			for(const text of texts) {
				builder = builder.add(text, value);
			}
		}

		return new ParsingValue(builder.build(), {
			partialBlankWhenNoToken: true,

			mapper: value => value
		});
	});
}
