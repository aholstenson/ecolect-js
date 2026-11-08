import type { Encounter } from '../src/graph/matching/Encounter.js';
import { Node } from '../src/graph/Node.js';
import { IntentsBuilder } from '../src/IntentsBuilder.js';
import { en } from '../src/language/en/index.js';
import type { TextPart } from '../src/resolver/expression/TextPart.js';
import { newPhrases } from '../src/resolver/newPhrases.js';
import { integerValue } from '../src/values/index.js';

/**
 * Node that reads nothing and counts how many paths reach it.
 */
class CountingNode extends Node {
	public calls = 0;

	public match(encounter: Encounter) {
		this.calls++;
		return encounter.advance(0, 0);
	}

	public equals(other: Node): boolean {
		return other === this;
	}
}

/**
 * Create a phrase with words that can each be left out.
 *
 * @param count -
 *   the number of words
 * @returns
 *   the phrase
 */
function optionalWords(count: number): string {
	const words: string[] = [];
	for(let i=0; i<count; i++) {
		words.push('[w' + i + ']');
	}
	return words.join(' ');
}

describe('Paths through phrases', function() {
	it('Partial match does not walk each way to leave words out', async function() {
		const counter = new CountingNode();
		const matcher = newPhrases()
			.phrase('start ' + optionalWords(10), counter, 'end')
			.toMatcher(en);

		const results = await matcher.matchPartial('start');

		expect(results.length).toBe(1);
		// The words can be left out in 1024 ways
		expect(counter.calls).toBeLessThan(200);
	});

	it('Full match does not walk each way to read glued groups', async function() {
		const counter = new CountingNode();
		const words = [
			'apple', 'bridge', 'candle', 'dragon', 'engine',
			'forest', 'garden', 'harbor', 'island', 'jacket'
		].map(word => word + '[s]');

		const matcher = newPhrases()
			.phrase('start ' + words.join(' '), counter, 'end')
			.toMatcher(en);

		const input = 'start ' + words.map(w => w.replace('[s]', 's')).join(' ') + ' end';
		expect(await matcher.match(input)).not.toBeNull();
		// `apples` reads as `apple` and as `apples`, so there are 1024 paths
		expect(counter.calls).toBeLessThan(200);
	});

	it('Values are the same as when every path is walked', async function() {
		const matcher = newPhrases()
			.value('n0', integerValue())
			.value('n1', integerValue())
			.phrase('show [to|{n0}] [{n1}] stop')
			.toMatcher(en);

		// The last of the matches with the same score is kept
		const result = await matcher.match('show 5 stop');
		expect(Object.keys(result?.values ?? {})).toEqual([ 'n1' ]);
	});

	it('Expression is the one of the matched path', async function() {
		const matcher = newPhrases()
			.phrase('show [all] [open] orders')
			.toMatcher(en);

		const results = await matcher.matchPartial('show all');
		expect(results.length).toBe(1);
		// The shortest way to complete the expression leaves `open` out
		const parts = results[0].expression as TextPart[];
		expect(parts.map(part => part.value)).toEqual([ 'show all orders' ]);
	});

	it('Partial match of intents does not walk each way to leave words out', async function() {
		const counter = new CountingNode();
		const matcher = new IntentsBuilder(en)
			.add('orders', newPhrases()
				.phrase('start ' + optionalWords(10), counter, 'end')
				.build()
			)
			.build();

		const results = await matcher.matchPartial('start');

		expect(results.map(r => r.id)).toEqual([ 'orders' ]);
		expect(counter.calls).toBeLessThan(200);
	});
});
