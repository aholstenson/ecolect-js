import { IntentsBuilder } from '../src/IntentsBuilder.js';
import { en } from '../src/language/en/index.js';
import { newPhrases } from '../src/resolver/newPhrases.js';
import type { ValueEncounter } from '../src/resolver/ValueEncounter.js';
import { customValue } from '../src/values/index.js';

import { assertNotNull } from './assertions.js';

const items = [ 'Balloons', 'Cookie Co' ];
async function match(encounter: ValueEncounter<string>) {
	const text = encounter.text.toLowerCase();
	for(const v of items) {
		if(v.toLowerCase().startsWith(text)) {
			encounter.match(v);

			if(! encounter.partial) return;
		}
	}
}

describe('Value: Custom', function() {
	describe('Full matching', function() {
		const resolver = newPhrases()
			.value('company', customValue(match))
			.phrase('{company}')
			.phrase('{company} company')
			.toMatcher(en);

		it('Invalid company', function() {
			return resolver.match('ABC')
				.then(r => {
					expect(r).toBeNull();
				});
		});

		it('Single token company', function() {
			return resolver.match('Balloons')
				.then(r => {
					assertNotNull(r);
					expect(r.values.company).toEqual('Balloons');
				});
		});

		it('Multi token company', function() {
			return resolver.match('Cookie Co')
				.then(r => {
					assertNotNull(r);
					expect(r.values.company).toEqual('Cookie Co');
				});
		});

		it('Multi token company with suffix', function() {
			return resolver.match('Cookie Co company')
				.then(r => {
					assertNotNull(r);
					expect(r.values.company).toEqual('Cookie Co');
				});
		});
	});

	describe('Partial matching', function() {
		const resolver = newPhrases()
			.value('company', customValue(match))
			.phrase('{company}')
			.phrase('{company} company')
			.toMatcher(en);

		it('Invalid company', function() {
			return resolver.matchPartial('A')
				.then(r => {
					expect(r.length).toEqual(0);
				});
		});

		it('Single token company', function() {
			return resolver.matchPartial('Ba')
				.then(r => {
					expect(r.length).toEqual(1);

					const match = r[0];
					expect(match.values.company).toEqual('Balloons');
				});
		});

		it('Multi token company', function() {
			return resolver.matchPartial('C')
				.then(r => {
					expect(r.length).toEqual(1);

					const match = r[0];
					expect(match.values.company).toEqual('Cookie Co');
				});
		});

		it('Multi token company with suffix', function() {
			return resolver.matchPartial('Cookie company')
				.then(r => {
					expect(r.length).toEqual(1);

					const match = r[0];
					expect(match.values.company).toEqual('Cookie Co');
				});
		});
	});

	describe('Matcher that throws', function() {
		const intents = new IntentsBuilder(en)
			.add('ok', newPhrases()
				.phrase('get stuff')
				.build()
			)
			.add('bad', newPhrases()
				.value('x', customValue(() => {
					throw new Error('remote lookup failed');
				}))
				.phrase('get {x}')
				.build()
			)
			.build();

		it('Other intent still matches', function() {
			return intents.match('get stuff')
				.then(r => {
					assertNotNull(r);
					expect(r.id).toEqual('ok');
				});
		});

		it('Other intent still matches when the matcher rejects', function() {
			const rejecting = new IntentsBuilder(en)
				.add('ok', newPhrases()
					.phrase('get stuff')
					.build()
				)
				.add('bad', newPhrases()
					.value('x', customValue(async () => {
						throw new Error('remote lookup failed');
					}))
					.phrase('get {x}')
					.build()
				)
				.build();

			return rejecting.match('get stuff')
				.then(r => {
					assertNotNull(r);
					expect(r.id).toEqual('ok');
				});
		});

		it('Match rejects with the value name when nothing else matches', async function() {
			const error = await intents.match('get things').then(() => null, (err: Error) => err);
			assertNotNull(error);
			expect(error.message).toContain('`x`');
			expect(error.message).toContain('remote lookup failed');
			expect((error.cause as Error).message).toEqual('remote lookup failed');
		});
	});
});
