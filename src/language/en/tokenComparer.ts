import type { TokenComparer } from '../../tokenization/index.js';
import { similarityTokenComparer } from '../algorithms/similarityTokenComparer.js';

/**
 * Token comparer for English. English words are compared on their exact
 * spelling, their Porter stem and how similar they are spelled, none of
 * which needs anything English specific.
 */
export const tokenComparer: TokenComparer = similarityTokenComparer;
