import { Token } from './Token.js';

export interface TokenComparer {
	compare(a: Token, b: Token): number;

	comparePartial(a: Token, b: Token): number;
}
