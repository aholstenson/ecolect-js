import { renderer } from '../generation/ValueRenderer.js';
import { valueEqual } from '../generation/valuesEqual.js';
import type { Encounter } from '../graph/index.js';
import { GraphBuilder } from '../graph/index.js';
import type { Language } from '../language/index.js';

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
 * Text of an item, as read by the language.
 */
interface ItemText<V> {
	/**
	 * The value the text resolves to.
	 */
	value: V;

	/**
	 * The text as written, with the white space of the tokens.
	 */
	raw: string;

	/**
	 * The number of tokens in the text.
	 */
	tokens: number;
}

/**
 * Read the texts of the items and group them by how the language reads
 * them, so that texts that only differ in case, such as `Red` and `red`, are
 * in the same group. The groups and the texts in them keep the order of the
 * items.
 *
 * @param language -
 *   the language that reads the texts
 * @param items -
 *   the items and their texts
 * @returns
 *   the texts, grouped by how they are read
 */
function groupTexts<V>(
	language: Language,
	items: readonly { value: V; texts: string[] }[]
): ItemText<V>[][] {
	const groups = new Map<string, ItemText<V>[]>();
	for(const item of items) {
		for(const text of item.texts) {
			const tokens = language.tokenizer(text);
			const key = tokens.map(t => t.normalized).join(' ');

			let group = groups.get(key);
			if(! group) {
				group = [];
				groups.set(key, group);
			}

			group.push({ value: item.value, raw: tokens.raw(), tokens: tokens.length });
		}
	}

	return [ ...groups.values() ];
}

/**
 * Get the text of a group that a match resolves to. This is the first text
 * that has the same case as the expression, or the first text of the group if
 * no text has the same case.
 *
 * @param group -
 *   the texts that are read the same way
 * @param encounter -
 *   the encounter that matched the texts
 * @returns
 *   the text the match resolves to
 */
function selectText<V>(group: ItemText<V>[], encounter: Encounter): ItemText<V> {
	for(const text of group) {
		const end = encounter.currentIndex;
		const raw = encounter.tokens.slice(Math.max(0, end - text.tokens), end).raw();
		if(raw === text.raw) {
			return text;
		}
	}

	return group[0];
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
 * If several items have texts that are read the same way, such as `Red` and
 * `red`, the item with the same case as the expression is used. If no item
 * has the same case, or the texts are equal, the first of the items is used.
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

	return new LanguageSpecificValue<V>(
		language => {
			let builder = new GraphBuilder<V>(language)
				.allowPartial();

			const groups = groupTexts(language, items.map(item => {
				const value = isEntry(item) ? item.value : item;
				const texts = isEntry(item) ? toTexts(item.text) : toTexts(mapper(value));
				return { value, texts };
			}));

			for(const group of groups) {
				const [ first ] = group;
				if(group.every(text => valueEqual(text.value, first.value))) {
					builder = builder.add(first.raw, first.value);
					continue;
				}

				/*
				 * The texts are read the same way but resolve to different
				 * values. Each text matches, but only the selected text
				 * gives its value, so a single match is found.
				 */
				for(const text of group) {
					builder = builder.add(
						text.raw,
						(data, options, encounter) => selectText(group, encounter) === text ? text.value : null
					);
				}
			}

			return new ParsingValue(builder.build(), {
				partialBlankWhenNoToken: true,

				mapper: value => value
			});
		},

		/*
		 * The items already say which text means which value, so writing one
		 * of them is a matter of looking it up.
		 */
		() => renderer<V>(value => {
			for(const item of items) {
				const itemValue = isEntry(item) ? item.value : item;
				if(! valueEqual(itemValue, value)) continue;

				return isEntry(item) ? toTexts(item.text) : toTexts(mapper(itemValue));
			}

			return [];
		})
	);
}
