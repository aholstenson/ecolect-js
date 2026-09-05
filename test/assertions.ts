/**
 * Assert that a match returned a result. Matching returns `null` when nothing
 * matched, and this narrows the type so that tests can read the result without
 * repeating a null check.
 *
 * @param value -
 *   the value to check
 */
export function assertNotNull<T>(value: T | null | undefined): asserts value is T {
	expect(value).not.toBeNull();
	expect(value).not.toBeUndefined();
}
