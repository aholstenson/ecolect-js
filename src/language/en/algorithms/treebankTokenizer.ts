/*
 * Implementation of the Treebank word tokenizer.
 *
 * Adapted from Talisman (`tokenizers/words/treebank`), which is available
 * under the MIT license. Copyright (c) 2016 Guillaume Plique (Yomguithereal).
 *
 * Original script: http://www.cis.upenn.edu/~treebank/tokenizer.sed
 */

const CONTRACTIONS2 = [
	/\b(can)(not)\b/gi,
	/\b(d)('ye)\b/gi,
	/\b(gim)(me)\b/gi,
	/\b(gon)(na)\b/gi,
	/\b(got)(ta)\b/gi,
	/\b(lem)(me)\b/gi,
	/\b(mor)('n)\b/gi,
	/\b(wan)(na) "/gi
];

const CONTRACTIONS3 = [
	/ ('t)(is)\b/gi,
	/ ('t)(was)\b/gi
];

const CONTRACTIONS4 = [
	/\b(whad)(dd)(ya)\b/gi,
	/\b(wha)(t)(cha)\b/gi
];

function applyContractions(contractions: RegExp[], replacement: string, text: string): string {
	for(let i = 0; i < contractions.length; i++) {
		text = text.replace(contractions[i], replacement);
	}
	return text;
}

type Rule = [ RegExp, string ];

const STARTING_QUOTES: Rule[] = [
	[ /^"/g, '``' ],
	[ /(``)/g, ' $1 ' ],
	[ /([ ([{<])"/g, '$1 `` ' ]
];

const PUNCTUATION: Rule[] = [
	[ /([:,])([^\d])/g, ' $1 $2' ],
	[ /([:,]$)/g, ' $1 ' ],
	[ /\.\.\./g, ' ... ' ],
	[ /([;@#$%&])/g, ' $1 ' ],
	[ /([^.])(\.)([\])}>"']*)\s*$/g, '$1 $2$3 ' ],
	[ /([?!])/g, ' $1 ' ],
	[ /([^'])' /g, '$1 \' ' ]
];

const PARENS_BRACKETS: Rule[] = [
	[ /([\][(){}<>])/g, ' $1 ' ],
	[ /--/g, ' -- ' ]
];

const ENDING_QUOTES: Rule[] = [
	[ /"/g, ' \'\' ' ],
	[ /(\S)('')/g, '$1 $2 ' ],
	[ /([^' ])('[sS]|'[mM]|'[dD]|') /g, '$1 $2 ' ],
	[ /([^' ])('ll|'LL|'re|'RE|'ve|'VE|n't|N'T) /g, '$1 $2 ' ]
];

function applyRules(rules: Rule[], text: string): string {
	for(let i = 0; i < rules.length; i++) {
		text = text.replace(rules[i][0], rules[i][1]);
	}
	return text;
}

/**
 * Words without quotes or punctuation that the rules still split, so they
 * can not take the fast path.
 */
const SPLIT_WORDS = new Set([
	'cannot',
	'gimme',
	'gonna',
	'gotta',
	'lemme',
	'wanna',
	'whaddya',
	'whatcha'
]);

/**
 * Characters that make a word subject to the quote, punctuation and
 * contraction rules.
 */
const NEEDS_RULES = /[^\p{L}\p{N}_]/u;

/**
 * Split raw text into words following the Treebank rules.
 *
 * @param text -
 *   the text to tokenize
 * @returns
 *   the tokens found in the text
 */
export function treebankTokenizer(text: string): string[] {
	/*
	 * Every rule acts on quotes, punctuation or one of a few known words, so
	 * a word made up of only letters and digits is returned as it is. This
	 * is the common case and skips running all of the rules.
	 */
	if(text.length > 0 && ! NEEDS_RULES.test(text) && ! SPLIT_WORDS.has(text.toLowerCase())) {
		return [ text ];
	}

	text = applyRules(STARTING_QUOTES, text);
	text = applyRules(PUNCTUATION, text);
	text = applyRules(PARENS_BRACKETS, text);

	text = ' ' + text + ' ';

	text = applyRules(ENDING_QUOTES, text);

	text = applyContractions(CONTRACTIONS2, ' $1 $2 ', text);
	text = applyContractions(CONTRACTIONS3, ' $1 $2 ', text);
	text = applyContractions(CONTRACTIONS4, ' $1 $2 $3 ', text);

	return text.split(/\s+/)
		.map(token => token.trim())
		.filter(token => token);
}
