/**
 * Character that closes a group, keyed by the character that opens it.
 */
const GROUP_END: Record<string, string> = {
	'(': ')',
	'[': ']'
};

/**
 * Characters that may not occur within a group, as groups can not be nested.
 */
const NESTED_GROUP = /[([\])]/;

/**
 * The highest number of ways a phrase can be written. Each group multiplies
 * the number of ways, so 12 groups that may be left out give 4096 ways.
 * Matchers for more ways are slow to build.
 */
export const MAX_PHRASE_VARIANTS = 4096;

/**
 * Throw an error if a phrase can be written in too many ways.
 *
 * @param count -
 *   the number of ways the phrase can be written
 * @param text -
 *   the phrase, for the error message
 */
export function checkVariantCount(count: number, text: string): void {
	if(count > MAX_PHRASE_VARIANTS) {
		throw new Error(
			'Phrase can be written in more than ' + MAX_PHRASE_VARIANTS + ' ways,'
			+ ' split it into several phrases or use fewer groups, in phrase: ' + text
		);
	}
}

/**
 * Expand a phrase into every way it can be written. Phrases may contain
 * groups of alternatives, either as `(a|b)` for a group that must match or
 * as `[a|b]` for a group that may also be left out:
 *
 * * `Show orders` expands into `Show orders`
 * * `[Show|List] orders` expands into `Show orders`, `List orders` and
 *   `orders`
 * * `Order(s)` expands into `Orders` and `Order`
 *
 * Alternatives are text and may contain both several words and values, so
 * `Orders (for|belonging to) {customer}` and `Orders (today|{when})` both
 * work. `|` can only be used in a group, and a group in `(` and `)` can not
 * have an empty alternative. There is no escape character, so a phrase can
 * not match the characters `(`, `)`, `[`, `]`, `{`, `}` and `|`.
 *
 * @param text -
 *   the phrase to expand
 * @returns
 *   every phrase the given text can be written as, without duplicates
 * @throws
 *   if a group is not closed, groups are nested, `|` is used outside of a
 *   group, a group in `(` and `)` has an empty alternative, or the phrase can
 *   be written in more than `MAX_PHRASE_VARIANTS` ways
 */
export function expandPhrase(text: string): string[] {
	let variants: string[] = [ '' ];

	/**
	 * Where the text that every variant shares starts. Moved past a group
	 * when the group has been expanded.
	 */
	let literalStart = 0;

	for(let i=0; i<text.length; i++) {
		const char = text[i];

		if(char === ')' || char === ']') {
			throw new Error('Unexpected `' + char + '`, no group has been opened, in phrase: ' + text);
		}

		if(char === '|') {
			throw new Error('`|` separates alternatives and can only be used in a group such as `(a|b)`, in phrase: ' + text);
		}

		if(char !== '(' && char !== '[') continue;

		const end = text.indexOf(GROUP_END[char], i + 1);
		if(end === -1) {
			throw new Error('Group opened with `' + char + '` is never closed, in phrase: ' + text);
		}

		const body = text.substring(i + 1, end);
		if(NESTED_GROUP.test(body)) {
			throw new Error('Groups can not be nested, in phrase: ' + text);
		}

		const alternatives = body.split('|');
		if(char === '(' && alternatives.some(alternative => alternative.trim() === '')) {
			throw new Error(
				'A group in `(` and `)` must match, so it can not have an empty alternative.'
				+ ' Use `[` and `]` for a group that may be left out, in phrase: ' + text
			);
		}

		if(char === '[') {
			// The group may be left out, so it also expands into nothing
			alternatives.push('');
		}

		checkVariantCount(variants.length * alternatives.length, text);

		const literal = text.substring(literalStart, i);
		const expanded: string[] = [];
		for(const variant of variants) {
			for(const alternative of alternatives) {
				expanded.push(variant + literal + alternative);
			}
		}

		variants = expanded;

		literalStart = end + 1;
		i = end;
	}

	const tail = text.substring(literalStart);

	const result: string[] = [];
	for(const variant of variants) {
		// Groups that were left out leave extra whitespace behind
		const phrase = (variant + tail).replace(/\s+/g, ' ').trim();

		if(phrase === '' || result.includes(phrase)) continue;

		result.push(phrase);
	}

	if(result.length === 0) {
		throw new Error('Phrase does not contain anything to match: ' + text);
	}

	return result;
}
