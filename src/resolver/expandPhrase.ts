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
 * work.
 *
 * @param text -
 *   the phrase to expand
 * @returns
 *   every phrase the given text can be written as, without duplicates
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
		if(char === '[') {
			// The group may be left out, so it also expands into nothing
			alternatives.push('');
		}

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
