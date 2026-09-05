/**
 * Value that is either available directly or via a promise. Matching is
 * synchronous for most nodes, and only becomes asynchronous when a node
 * needs to wait for something, such as a value being validated remotely.
 * Keeping the synchronous case free from promises makes matching faster.
 */
export type MaybePromise<T> = T | Promise<T>;

/**
 * Check if the given value is a promise or another thenable.
 *
 * @param value -
 *   value to check
 * @returns
 *   true if the value has a `then` function
 */
export function isThenable(value: unknown): value is Promise<any> {
	return value !== null
		&& typeof value === 'object'
		&& typeof (value as Promise<any>).then === 'function';
}

/**
 * Run a function after the given value is available. If the value is not a
 * promise the function runs directly.
 *
 * @param value -
 *   value to wait for
 * @param func -
 *   function to run when the value is available
 * @returns
 *   the result of the function, via a promise if the value was a promise
 */
export function after<T, R>(value: MaybePromise<T>, func: (value: T) => MaybePromise<R>): MaybePromise<R> {
	if(isThenable(value)) {
		return value.then(func);
	}

	return func(value);
}

/**
 * Run a step for every index from `from` up to but not including `length`,
 * one after the other. Steps run directly until one of them returns a
 * promise, after which the remaining steps wait for it.
 *
 * @param length -
 *   the number of steps
 * @param step -
 *   function to run for every index
 * @param from -
 *   the index to start at
 * @returns
 *   nothing, via a promise if any step returned a promise
 */
export function sequence(length: number, step: (index: number) => MaybePromise<unknown>, from=0): MaybePromise<void> {
	for(let i=from; i<length; i++) {
		const result = step(i);
		if(isThenable(result)) {
			return result.then(() => sequence(length, step, i + 1));
		}
	}
}

/**
 * Turn the given value into a promise.
 *
 * @param value -
 *   value to wrap
 * @returns
 *   promise resolving to the value
 */
export function toPromise<T>(value: MaybePromise<T>): Promise<T> {
	return isThenable(value) ? value : Promise.resolve(value);
}
