import { Match } from './Match.js';

/**
 * Handler for matches found.
 */
export type MatchHandler = (match: Match<any>) => void;
