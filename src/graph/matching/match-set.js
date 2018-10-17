import { isDeepEqual } from '../../utils/equality';

function binarySearch(items, fromIndex, toIndex, key) {
	let low = fromIndex;
	let high = toIndex - 1;
	while(low <= high) {
		const mid = Math.floor((low + high) / 2);
		const v = items[mid].score;

		if(v > key) {
			low = mid + 1;
		} else if(v < key) {
			high = mid - 1;
		} else {
			return mid;
		}
	}

	// Return a negative insert position if not found
	return -(low + 1);
}

/**
 * Find the insert location of an matches with the given score.
 *
 * @param {number} score
 */
function findInsertLocation(matches, score) {
	const idx = binarySearch(matches, 0, matches.length, score);

	if(idx < 0) {
		// If the score was not found
		return - idx - 1;
	}

	/*
		* Something with the same score was found, make sure this item is
		* added after all previous items with the same score.
		*/
	for(let i=idx+1; i<matches.length; i++) {
		if(matches[i].score < score) return i;
	}

	return matches.length;
}

/**
 * Set that helps with keeping track of matches. This set will always keep
 * matches ordered by score in descending order.
 *
 * It also supports filtering the incoming matches, to support cases where
 * only a single match should be kept, such as only a single intent with the
 * highest score.
 */
export default class MatchSet {

	constructor(options={}) {
		this.matches = [];
		this.isEqual = options.isEqual || isDeepEqual;
	}

	/**
	 * Add a new match to this list.
	 *
	 * @param {Match} match
	 */
	add(match) {
		// Check if this is a duplicate match
		for(let i=0; i<this.matches.length; i++) {
			const matchInfo = this.matches[i];
			if(this.isEqual(matchInfo.data, match.data)) {
				// This match is a duplicate and should be skipped
				if(match.score < matchInfo.score) {
					// This match has a worse score, no need to update
					return false;
				}

				// Delete the current match
				this.matches.splice(i, 1);
				break;
			}
		}

		const idx = findInsertLocation(this.matches, match.score);
		this.matches.splice(idx, 0, match);
		return true;
	}

	/**
	 * Get an iterator for this set.
	 */
	[Symbol.iterator]() {
		return this.matches[Symbol.iterator]();
	}

	/**
	 * Get the array representation of this set.
	 */
	toArray() {
		return this.matches;
	}
}
