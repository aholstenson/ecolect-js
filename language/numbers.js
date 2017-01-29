'use strict';

/**
 * Combine two numbers when parsing.
 */
module.exports.combine = function combine(a, b) {
	if(a.suffix && b.suffix) {
		const value = a.value * b.value;
		return {
			value: value,
			raw: value,
			integer: a.integer && b.integer,
			suffix: true,
			literal: true
		};
	} else if(b.suffix) {
		const value = a.value * b.value;
		return {
			value: value,
			raw: value,
			integer: a.integer && b.integer,
			suffixed: true,
			literal: true
		};
	} else {
		const raw = a.raw + b.raw;
		const value = parseInt(a.raw + b.raw);

		return {
			value: value,
			raw: raw,
			integer: a.integer && b.integer,
			literal: a.literal || b.literal
		};
	}
};

module.exports.negative = function negative(o) {
	return {
		value: - o.value,
		raw: '-' + o.raw,
		integer: o.integer
	};
};

module.exports.float = function float(a, b) {
	const raw = a.raw + '.' + b.raw;
	return {
		value: parseFloat(raw),
		raw: raw,
		integer: false
	};
};

module.exports.map = function(data) {
	return new NumberValue(data);
}

class NumberValue {
	constructor(obj) {
		this.value = obj.value;
	}

	format() {
		return String(this.value);
	}
}
