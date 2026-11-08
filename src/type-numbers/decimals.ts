/**
 * Exact math on decimal numbers written as text, such as `-12.5`. Numbers
 * are read from text and combined, as in `1.15 hundred`. Math with the
 * numbers of JavaScript gives values such as `114.99999999999999`, so the
 * digits of a number are combined with this math instead.
 */

/**
 * A decimal number as an integer and the number of digits after the
 * decimal point. `-12.5` is the coefficient `-125` with the scale `1`.
 */
interface ExactDecimal {
	coefficient: bigint;
	scale: number;
}

/**
 * Text that is a decimal number, with an optional sign, digits and an
 * optional decimal part.
 */
const DECIMAL = /^([+-]?)([0-9]*)(?:\.([0-9]*))?$/;

/**
 * Read a decimal number from text.
 *
 * @param text -
 *   the text, such as `-12.5` or `000`
 * @returns
 *   the decimal number
 */
function parse(text: string): ExactDecimal {
	const match = DECIMAL.exec(text);
	if(! match) {
		throw new Error('`' + text + '` is not a decimal number');
	}

	const fraction = match[3] ?? '';
	const digits = (match[2] + fraction) || '0';
	const coefficient = BigInt(digits);
	return {
		coefficient: match[1] === '-' ? - coefficient : coefficient,
		scale: fraction.length
	};
}

/**
 * Write a decimal number as text, without zeros at the end of the decimal
 * part and without a decimal point if there is no decimal part.
 *
 * @param value -
 *   the decimal number
 * @returns
 *   the text, such as `-12.5` or `1500`
 */
function format(value: ExactDecimal): string {
	let { coefficient, scale } = value;
	while(scale > 0 && coefficient % 10n === 0n) {
		coefficient /= 10n;
		scale--;
	}

	const negative = coefficient < 0n;
	const digits = (negative ? - coefficient : coefficient).toString();
	if(scale === 0) {
		return (negative ? '-' : '') + digits;
	}

	const padded = digits.padStart(scale + 1, '0');
	const point = padded.length - scale;
	return (negative ? '-' : '')
		+ padded.substring(0, point)
		+ '.'
		+ padded.substring(point);
}

/**
 * Change the scale of a decimal number to a larger scale.
 *
 * @param value -
 *   the decimal number
 * @param scale -
 *   the new scale, at least the current scale
 * @returns
 *   the coefficient for the new scale
 */
function withScale(value: ExactDecimal, scale: number): bigint {
	return value.coefficient * (10n ** BigInt(scale - value.scale));
}

/**
 * Add two decimal numbers exactly.
 *
 * @param a -
 *   the first number, such as `1.1`
 * @param b -
 *   the second number, such as `2.25`
 * @returns
 *   the sum, such as `3.35`
 */
export function addDecimals(a: string, b: string): string {
	const x = parse(a);
	const y = parse(b);
	const scale = Math.max(x.scale, y.scale);
	return format({
		coefficient: withScale(x, scale) + withScale(y, scale),
		scale: scale
	});
}

/**
 * Multiply two decimal numbers exactly.
 *
 * @param a -
 *   the first number, such as `1.15`
 * @param b -
 *   the second number, such as `100`
 * @returns
 *   the product, such as `115`
 */
export function multiplyDecimals(a: string, b: string): string {
	const x = parse(a);
	const y = parse(b);
	return format({
		coefficient: x.coefficient * y.coefficient,
		scale: x.scale + y.scale
	});
}

/**
 * Write ten to the given power as a decimal number.
 *
 * @param exponent -
 *   the power, such as `3` or `-2`
 * @returns
 *   the number, such as `1000` or `0.01`
 */
export function powerOfTenDecimal(exponent: number): string {
	return exponent >= 0
		? format({ coefficient: 10n ** BigInt(exponent), scale: 0 })
		: format({ coefficient: 1n, scale: - exponent });
}
