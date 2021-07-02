import { Token } from './Token';

export interface Tokens extends Array<Token> {
	/**
	 * Assemble the raw string value of the tokens contained within this
	 * collection.
	 */
	raw(): string;

	slice(start?: number, end?: number): Tokens;
}

export const Tokens = {
	empty() {
		return makeTokens([]);
	}
};

const slice = function(this: Tokens, ...args: any) {
	const array = Array.prototype.slice.apply(this, args);
	return makeTokens(array);
};

function makeTokens(array: object[]): Tokens {
	const result: Tokens = array as Tokens;
	result.raw = tokensRawValue;
	result.slice = slice;
	return result;
}

function tokensRawValue(this: Tokens): string {
	if(this.length === 0) return '';

	const result = [];
	let index = this[0].start;
	for(let i=0; i<this.length; i++) {
		const token = this[i];

		for(let j=index; j<token.start; j++) {
			result.push(' ');
		}
		index = token.stop;

		result.push(token.raw);
	}

	return result.join('');
}
