import { Token } from './Token';

export interface TokenComparer {
	compare(a: Token, b: Token): number;

	comparePartial(a: Token, b: Token): number;
}
