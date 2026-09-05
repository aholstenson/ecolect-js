import { TokenComparer } from '../../tokenization/index.js';
import { similarityTokenComparer } from '../algorithms/similarityTokenComparer.js';

/**
 * Token comparer for Swedish. Swedish words are compared on their exact
 * spelling, their Snowball stem and how similar they are spelled, none of
 * which needs anything Swedish specific.
 */
export const tokenComparer: TokenComparer = similarityTokenComparer;
