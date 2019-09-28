import { NumberData } from './number-data';
import { NumberValue } from './number-value';

export function isDigits(o: NumberData): boolean {
	return ! o.literal;
}

export function isDigitsCompatible(o: NumberData): boolean {
	return o.suffix || ! o.literal;
}

export function isLiteral(o: NumberData): boolean {
	return o.literal;
}

export function isNegative(o: NumberData): boolean {
	return o.value < 0;
}

export function literalNumber(value: number, raw: string, suffix=false): NumberData {
	return {
		value: value,
		rawDigits: raw,
		literal: true,

		suffix: suffix,
		integer: value % 1 === 0
	};
}

export function digitNumber(value: number, raw: string, suffix=false): NumberData {
	return {
		value: value,
		rawDigits: raw,
		literal: false,

		suffix: suffix,
		integer: value % 1 === 0
	};
}

/**
 * Combine two numbers when parsing.
 */
export function combine(a: NumberData, b: NumberData): NumberData {
	if(a.suffix && b.suffix) {
		const value = a.value * b.value;
		return {
			value: value,
			rawDigits: String(value),
			integer: a.integer && b.integer,
			suffix: true,
			literal: true
		};
	} else if(b.suffix) {
		const value = a.value * b.value;
		return {
			value: value,
			rawDigits: String(value),
			integer: a.integer && b.integer,
			suffix: true,
			literal: true
		};
	} else {
		const raw = a.rawDigits + b.rawDigits;
		const value = parseInt(raw, 10);

		return {
			value: value,
			rawDigits: raw,
			integer: a.integer && b.integer,
			literal: a.literal || b.literal,
			suffix: false
		};
	}
}

export function negative(o: NumberData): NumberData {
	return {
		value: - o.value,
		rawDigits: '-' + o.rawDigits,
		integer: o.integer,
		suffix: false,
		literal: o.literal
	};
}

export function float(a: NumberData, b: NumberData): NumberData {
	const raw = a.rawDigits + '.' + b.rawDigits;
	return {
		value: parseFloat(raw),
		rawDigits: raw,
		integer: false,
		literal: false,
		suffix: false
	};
}

export function map(data: NumberData) {
	return new NumberValue(data);
}
