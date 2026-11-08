/**
 * Check how fast work grows with the size of the input.
 *
 * A fixed time limit fails on slow machines, when coverage is on, or when
 * many test files run at the same time. This check compares the time for a
 * small input with the time for a large input on the same machine. The speed
 * of the machine has no effect on the ratio, but a change in how the work
 * grows, such as from linear to quadratic or to exponential, does.
 */

/**
 * Options for `expectGrowth`.
 */
export interface GrowthOptions {
	/**
	 * Size of the small input.
	 */
	from: number;

	/**
	 * Size of the large input. Use at least four times `from` to make the
	 * check sensitive.
	 */
	to: number;

	/**
	 * Highest power of the size that the time can grow with. Use 1 for
	 * linear and 2 for quadratic.
	 */
	degree: number;
}

/**
 * Time that a batch of runs takes at minimum. Many runs of a fast input are
 * measured together, because a single run can be shorter than the resolution
 * of the timer. Browsers make the timer less precise on purpose.
 */
const MIN_BATCH_MS = 20;

/**
 * Number of batches to measure for each size. The fastest batch is used,
 * because other work on the machine can only make a batch slower. Batches of
 * the two sizes are measured in turn, so that a period of high load affects
 * both sizes.
 */
const BATCHES = 3;

/**
 * Number of times to measure before the check fails. Noise from other work on
 * the machine seldom occurs in each attempt, but a change in how the work
 * grows does.
 */
const ATTEMPTS = 3;

/**
 * Factor that the ratio can be above the expected ratio before the check
 * fails. This lets constant work, garbage collection and noise through, but
 * a step to the next degree with `to` four times `from` does not get through.
 */
const MARGIN = 3;

/**
 * Measure the time of one run of `run` in a batch of runs.
 *
 * @param run -
 *   the work to measure
 * @returns
 *   the mean time of one run in the batch, in milliseconds
 */
async function measureBatch(run: () => unknown): Promise<number> {
	let runs = 0;
	const start = performance.now();
	let elapsed: number;
	do {
		await run();
		runs++;
		elapsed = performance.now() - start;
	} while(elapsed < MIN_BATCH_MS);

	return elapsed / runs;
}

/**
 * Expect that the time of `run` grows no faster than the size of the input
 * to the power of `degree`.
 *
 * @param run -
 *   the work to measure for an input of the given size
 * @param options -
 *   the sizes to compare and the expected degree
 */
export async function expectGrowth(
	run: (size: number) => unknown,
	options: GrowthOptions
): Promise<void> {
	const { from, to, degree } = options;
	const limit = Math.pow(to / from, degree) * MARGIN;

	// Warm up so that the first run does not include compiling and caching
	await run(from);
	await run(to);

	let small = Infinity;
	let large = Infinity;
	for(let attempt = 0; attempt < ATTEMPTS; attempt++) {
		for(let batch = 0; batch < BATCHES; batch++) {
			small = Math.min(small, await measureBatch(() => run(from)));
			large = Math.min(large, await measureBatch(() => run(to)));
		}

		if(large / small < limit) {
			return;
		}
	}

	expect(
		large / small,
		`size ${from} took ${small.toFixed(2)} ms and size ${to} took ${large.toFixed(2)} ms`
	).toBeLessThan(limit);
}
