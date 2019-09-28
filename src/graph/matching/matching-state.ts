export interface MatchingState {
	currentIndex: number;

}

export function emptyState(): MatchingState {
	return {
		currentIndex: -1
	};
}
