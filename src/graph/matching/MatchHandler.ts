import { Match } from './Match.js';
import { MaybePromise } from './maybePromise.js';

/**
 * Handler for matches found. May return a promise if the match needs
 * asynchronous work before matching can continue.
 */
export type MatchHandler = (match: Match<any>) => MaybePromise<unknown>;
