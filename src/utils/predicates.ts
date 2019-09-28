/**
 * Predicate that checks if a specific object matches.
 */
export type Predicate<V> = (obj: V) => boolean;

export const alwaysTruePredicate = () => true;
