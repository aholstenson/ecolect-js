/*
 * The classical Porter stemmer.
 *
 * Adapted from Talisman (`stemmers/porter`), which is available under the MIT
 * license. Copyright (c) 2016 Guillaume Plique (Yomguithereal).
 *
 * Reference: http://tartarus.org/martin/PorterStemmer/
 *
 * Article: C.J. van Rijsbergen, S.E. Robertson and M.F. Porter, 1980. New
 * models in probabilistic information retrieval. London: British Library.
 * (British Library Research and Development Report, no. 5587).
 */

const STEP2_SUFFIXES = [
	'ational', 'tional', 'enci', 'anci', 'izer', 'bli', 'alli', 'entli', 'eli',
	'ousli', 'ization', 'ation', 'ator', 'alism', 'iveness', 'fulness',
	'ousness', 'aliti', 'iviti', 'biliti', 'logi'
];

const STEP3_SUFFIXES = [
	'icate', 'ative', 'alize', 'iciti', 'ical', 'ful', 'ness'
];

const STEP4_SUFFIXES = [
	'al', 'ance', 'ence', 'er', 'ic', 'able', 'ible', 'ant', 'ement', 'ment',
	'ent', 'ou', 'ism', 'ate', 'iti', 'ous', 'ive', 'ize'
];

const STEP2_SUFFIXES_REGEX = new RegExp('^(.+?)(' + STEP2_SUFFIXES.join('|') + ')$');
const STEP3_SUFFIXES_REGEX = new RegExp('^(.+?)(' + STEP3_SUFFIXES.join('|') + ')$');
const STEP4_SUFFIXES_REGEX = new RegExp('^(.+?)(' + STEP4_SUFFIXES.join('|') + ')$');

const STEP2_MAP: Record<string, string> = {
	ational: 'ate',
	tional: 'tion',
	enci: 'ence',
	anci: 'ance',
	izer: 'ize',
	bli: 'ble',
	alli: 'al',
	entli: 'ent',
	eli: 'e',
	ousli: 'ous',
	ization: 'ize',
	ation: 'ate',
	ator: 'ate',
	alism: 'al',
	iveness: 'ive',
	fulness: 'ful',
	ousness: 'ous',
	aliti: 'al',
	iviti: 'ive',
	biliti: 'ble',
	logi: 'log'
};

const STEP3_MAP: Record<string, string> = {
	icate: 'ic',
	ative: '',
	alize: 'al',
	iciti: 'ic',
	ical: 'ic',
	ful: '',
	ness: ''
};

const C = '[^aeiou]';
const V = '[aeiouy]';
const CC = C + C + '*';
const VV = V + V + '*';

const MGR0 = new RegExp('^(' + CC + ')?' + VV + CC);
const MEQ1 = new RegExp('^(' + CC + ')?' + VV + CC + '(' + VV + ')?$');
const MGR1 = new RegExp('^(' + CC + ')?' + VV + CC + VV + CC);
const VOWEL_IN_STEM = new RegExp('^(' + CC + ')?' + V);

const STEP1a1 = /^(.+?)(ss|i)es$/;
const STEP1a2 = /^(.+?)([^s])s$/;

const STEP1b1 = /^(.+?)eed$/;
const STEP1b2 = /^(.+?)(ed|ing)$/;
const STEP1b3 = /(at|bl|iz)$/;
const STEP1b4 = /([^aeiouylsz])\1$/;
const STEP1b5 = new RegExp('^' + CC + V + '[^aeiouwxy]$');

const STEP1c = new RegExp('^(.*' + V + '.*)y$');

const STEP4 = /^(.+?)(s|t)(ion)$/;

const STEP51 = /^(.+?)e$/;
const STEP52 = new RegExp('^' + CC + V + '[^aeiouwxy]$');

function chop(value: string): string {
	return value.slice(0, -1);
}

function match(regex: RegExp, value: string): RegExpExecArray | null {
	const result = regex.exec(value);
	regex.lastIndex = 0;
	return result;
}

/**
 * Reduce a word to its Porter stem.
 *
 * @param word -
 *   the word to stem
 * @returns
 *   the resulting stem
 */
export function porterStemmer(word: string): string {
	word = word.toLowerCase();

	// If the word is too short, we return it unscathed
	if(word.length < 3) return word;

	let m: RegExpExecArray | null;

	// If the first letter is a Y, we uppercase it so it is not treated as a vowel
	if(word[0] === 'y') word = 'Y' + word.slice(1);

	// Step 1a
	word = word.replace(STEP1a1, '$1$2');
	word = word.replace(STEP1a2, '$1$2');

	// Step 1b
	if((m = match(STEP1b1, word))) {
		if(MGR0.test(m[1])) word = chop(word);
	} else if((m = match(STEP1b2, word))) {
		const stem = m[1];
		if(VOWEL_IN_STEM.test(stem)) {
			word = stem;

			if(STEP1b3.test(word)) word = word + 'e';
			else if(STEP1b4.test(word)) word = chop(word);
			else if(STEP1b5.test(word)) word = word + 'e';
		}
	}

	// Step 1c
	if((m = match(STEP1c, word))) {
		word = m[1] + 'i';
	}

	// Step 2
	if((m = match(STEP2_SUFFIXES_REGEX, word))) {
		const stem = m[1];
		if(MGR0.test(stem)) word = stem + STEP2_MAP[m[2]];
	}

	// Step 3
	if((m = match(STEP3_SUFFIXES_REGEX, word))) {
		const stem = m[1];
		if(MGR0.test(stem)) word = stem + STEP3_MAP[m[2]];
	}

	// Step 4
	if((m = match(STEP4_SUFFIXES_REGEX, word))) {
		const stem = m[1];
		if(MGR1.test(stem)) word = stem;
	} else if((m = match(STEP4, word))) {
		const stem = m[1] + m[2];
		if(MGR1.test(stem)) word = stem;
	}

	// Step 5
	if((m = match(STEP51, word))) {
		const stem = m[1];
		if(MGR1.test(stem) || (MEQ1.test(stem) && ! STEP52.test(stem))) word = stem;
	}

	if(/ll$/.test(word) && MGR1.test(word)) word = chop(word);

	return word.toLowerCase();
}
