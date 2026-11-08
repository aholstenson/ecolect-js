/**
 * The highest number of ways a phrase can be written. Each group multiplies
 * the number of ways, so 12 groups that may be left out give 4096 ways.
 *
 * The graph of a phrase grows with the number of groups and not with the
 * number of ways. But partial matching of an expression that ends before
 * the groups, and the generation of text, look at each way. More ways make
 * these slow.
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
 * A value referred to by name in a phrase, such as `{when}`. A name is
 * written with the letters and digits of the English alphabet, whatever
 * language the words around it are written in.
 */
export const VALUE = /{([a-zA-Z0-9]+)}/g;

/**
 * A brace left in a phrase after every value has been read. Braces are only
 * used to name a value, so one that is left over belongs to a value that was
 * written wrong.
 */
export const LEFTOVER_BRACE = /{[^{}]*}|[{}]/;

/**
 * Describe the part of a phrase that was meant to be a value, so that the
 * error says which one to correct.
 *
 * @param text -
 *   the text of the phrase that no value was read from
 * @returns
 *   the part that looks like a value, or the whole text if none stands out
 */
export function describeLeftover(text: string): string {
	return LEFTOVER_BRACE.exec(text)?.[0] ?? text;
}

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
 * Whitespace that separates the words of a phrase.
 */
const WHITESPACE = /\s/;

/**
 * A part of a phrase that is one of several texts. Each text has no groups,
 * but can have words and values. Text without groups is a part with one
 * text.
 */
export interface PhraseSegment {
	/**
	 * The texts this part can be, in the order they are written. No text is
	 * empty and no text occurs two times.
	 */
	alternatives: string[];

	/**
	 * If the part can also be left out.
	 */
	optional: boolean;
}

/**
 * A group of alternatives as it is written in a phrase.
 */
interface GroupAtom {
	/**
	 * The alternatives of the group. A group in `[` and `]` has an empty
	 * alternative as its last alternative.
	 */
	alternatives: string[];
}

/**
 * Read a phrase into its parts. Each group of alternatives that is
 * written between whitespace, such as `[show|list] orders`, is a part of its
 * own. A group that is joined to text or to another group without whitespace,
 * such as `order[s]` or `(re|un)do`, is expanded together with the text it is
 * joined to, so that each way to write the word is one alternative.
 *
 * Phrases may contain groups of alternatives, either as `(a|b)` for a group
 * that must match or as `[a|b]` for a group that may also be left out:
 *
 * * `Show orders` is one part, `Show orders`
 * * `[Show|List] orders` is a part that is `Show` or `List` or left out,
 *   then the part `orders`
 * * `Order(s)` is one part that is `Orders` or `Order`
 *
 * Alternatives are text and may contain both several words and values, so
 * `Orders (for|belonging to) {customer}` and `Orders (today|{when})` both
 * work. `|` can only be used in a group, and a group in `(` and `)` can not
 * have an empty alternative. There is no escape character, so a phrase can
 * not match the characters `(`, `)`, `[`, `]`, `{`, `}` and `|`.
 *
 * The number of ways is only checked for each word with groups here. The
 * caller checks the number of ways of the full phrase.
 *
 * @param text -
 *   the phrase to read
 * @returns
 *   the parts of the phrase, in order
 * @throws
 *   if a group is not closed, groups are nested, `|` is used outside of a
 *   group, a group in `(` and `)` has an empty alternative, or a word with
 *   groups can be written in more than `MAX_PHRASE_VARIANTS` ways
 */
export function parsePhraseSyntax(text: string): PhraseSegment[] {
	const atoms = readAtoms(text);

	const segments: PhraseSegment[] = [];

	/**
	 * Text without groups that is not yet added as a part.
	 */
	let literal = '';

	/**
	 * The characters and groups of the word being read. A word ends at
	 * whitespace that is not in a group.
	 */
	let word: (string | GroupAtom)[] = [];

	const flushLiteral = () => {
		const normalized = normalize(literal);
		if(normalized !== '') {
			segments.push({ alternatives: [ normalized ], optional: false });
		}

		literal = '';
	};

	const flushWord = () => {
		if(! word.some(atom => typeof atom !== 'string')) {
			// A word without groups is plain text
			literal += word.join('');
			word = [];
			return;
		}

		flushLiteral();
		segments.push(expandWord(word, text));
		word = [];
	};

	for(const atom of atoms) {
		if(typeof atom === 'string' && WHITESPACE.test(atom)) {
			flushWord();
			literal += atom;
		} else {
			word.push(atom);
		}
	}

	flushWord();
	flushLiteral();

	return segments;
}

/**
 * Read a phrase into characters and groups.
 *
 * @param text -
 *   the phrase to read
 * @returns
 *   the characters outside of groups, and the groups
 */
function readAtoms(text: string): (string | GroupAtom)[] {
	const atoms: (string | GroupAtom)[] = [];

	for(let i=0; i<text.length; i++) {
		const char = text[i];

		if(char === ')' || char === ']') {
			throw new Error('Unexpected `' + char + '`, no group has been opened, in phrase: ' + text);
		}

		if(char === '|') {
			throw new Error('`|` separates alternatives and can only be used in a group such as `(a|b)`, in phrase: ' + text);
		}

		if(char !== '(' && char !== '[') {
			atoms.push(char);
			continue;
		}

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

		atoms.push({ alternatives });
		i = end;
	}

	return atoms;
}

/**
 * Expand a word that has groups into every way it can be written. The first
 * alternative of each group comes first, and a group that is left out comes
 * last.
 *
 * @param word -
 *   the characters and groups of the word
 * @param text -
 *   the phrase, for the error message
 * @returns
 *   the part for the word
 */
function expandWord(word: (string | GroupAtom)[], text: string): PhraseSegment {
	let variants: string[] = [ '' ];
	for(const atom of word) {
		if(typeof atom === 'string') {
			variants = variants.map(variant => variant + atom);
			continue;
		}

		checkVariantCount(variants.length * atom.alternatives.length, text);

		const expanded: string[] = [];
		for(const variant of variants) {
			for(const alternative of atom.alternatives) {
				expanded.push(variant + alternative);
			}
		}

		variants = expanded;
	}

	const alternatives: string[] = [];
	let optional = false;
	for(const variant of variants) {
		const normalized = normalize(variant);
		if(normalized === '') {
			optional = true;
		} else if(! alternatives.includes(normalized)) {
			alternatives.push(normalized);
		}
	}

	return { alternatives, optional };
}

/**
 * Change each sequence of whitespace into one space, and remove whitespace
 * at the start and the end.
 *
 * @param text -
 *   the text to change
 * @returns
 *   the changed text
 */
function normalize(text: string): string {
	return text.replace(/\s+/g, ' ').trim();
}
