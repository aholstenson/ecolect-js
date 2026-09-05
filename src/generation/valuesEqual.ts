import { deepEqual } from 'fast-equals';

/**
 * Get if two values are the same. Values that know how to compare themselves,
 * such as the dates and numbers the value types resolve to, are asked to do
 * so, and everything else is compared field by field.
 *
 * @param a -
 *   the first value
 * @param b -
 *   the second value
 * @returns
 *   `true` if the values are the same
 */
export function valueEqual(a: any, b: any): boolean {
	if(a === b) return true;
	if(a === null || b === null || typeof a === 'undefined' || typeof b === 'undefined') return false;

	if(typeof a === 'object' && typeof a.equals === 'function') {
		return a.equals(b) === true;
	}

	if(typeof a === 'object' && typeof b === 'object' && ! Array.isArray(a) && ! Array.isArray(b)) {
		/*
		 * A field that is not set is the same as a field that is set to
		 * nothing, so that a value written by hand is the same as the one a
		 * match resolves.
		 */
		return deepEqual(withoutUndefined(a), withoutUndefined(b));
	}

	return deepEqual(a, b);
}

/**
 * Copy an object, leaving out the fields that are not set.
 *
 * @param object -
 *   the object to copy
 * @returns
 *   the copy
 */
function withoutUndefined(object: any): any {
	const result: any = {};
	for(const key of definedKeys(object)) {
		result[key] = object[key];
	}

	return result;
}

/**
 * Get if two sets of values are the same. Values that are not set are left
 * out, so a value that is `undefined` is the same as one that was never
 * given.
 *
 * @param a -
 *   the first set of values
 * @param b -
 *   the second set of values
 * @returns
 *   `true` if the sets hold the same values
 */
export function valuesEqual(a: any, b: any): boolean {
	if(! a || ! b) return false;

	const keysA = definedKeys(a);
	const keysB = definedKeys(b);

	if(keysA.length !== keysB.length) return false;

	for(const key of keysA) {
		if(! keysB.includes(key)) return false;
		if(! valueEqual(a[key], b[key])) return false;
	}

	return true;
}

/**
 * Get the keys of an object that have a value.
 *
 * @param object -
 *   the object to read
 * @returns
 *   the keys that are set
 */
export function definedKeys(object: any): string[] {
	return Object.keys(object).filter(key => typeof object[key] !== 'undefined');
}
