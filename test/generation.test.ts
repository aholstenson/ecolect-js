import { DateInterval, LocalDate, LocalDateTime, LocalTime } from 'datetime-types';
import { BigDecimal } from 'numeric-types/decimal';
import { BigInteger } from 'numeric-types/integer';

import { renderer, templatesFrom, TemplateGenerator, textsFor } from '../src/generation/index.js';
import { intentsBuilder } from '../src/index.js';
import { en } from '../src/language/en/index.js';
import { KnownGraphs, Language } from '../src/language/index.js';
import { sv } from '../src/language/sv/index.js';
import { newPhrases } from '../src/resolver/newPhrases.js';
import { DateTimeData, MutableDuration } from '../src/type-datetime/index.js';
import {
	anyTextValue,
	booleanValue,
	customValue,
	dateDurationValue,
	dateIntervalValue,
	dateTimeDurationValue,
	dateTimeValue,
	dateValue,
	enumerationValue,
	integerValue,
	numberValue,
	ordinalValue,
	timeDurationValue,
	timeValue
} from '../src/values/index.js';

import { assertNotNull } from './assertions.js';

const NOW = new Date(2020, 0, 15, 12, 0, 0);

/**
 * Create a generator for a single value, so that a value type can be checked
 * on its own.
 *
 * @param language -
 *   the language to write the text in
 * @param value -
 *   the type of the value
 * @returns
 *   generator that writes `x` followed by the value
 */
function generatorFor(language: Language, value: any) {
	return newPhrases()
		.value('v', value)
		.phrase('x {v}')
		.toGenerator(language);
}

describe('Generation', function() {
	describe('Intents', () => {
		const builder = () => intentsBuilder(en)
			.add('orders', newPhrases()
				.value('when', dateIntervalValue())
				.phrase('[Show] Orders')
				.phrase('[Show] Orders (in|from) {when}')
				.build()
			)
			.add('search', newPhrases()
				.value('query', anyTextValue())
				.phrase('Find {query}')
				.build()
			);

		const generator = builder().buildGenerator();
		const matcher = builder().build();

		it('Intent without values', async () => {
			expect(await generator.generate('orders')).toEqual('Orders');
		});

		it('Intent with a value', async () => {
			const when = DateInterval.between(
				LocalDate.of(2025, 1, 1),
				LocalDate.of(2025, 12, 31)
			);

			expect(await generator.generate('orders', { when: when }, { now: NOW }))
				.toEqual('Orders in 2025');
		});

		it('Text is matched back to the intent it was written for', async () => {
			const when = DateInterval.between(
				LocalDate.of(2025, 3, 4),
				LocalDate.of(2025, 4, 15)
			);

			const text = await generator.generate('orders', { when: when }, { now: NOW });
			assertNotNull(text);

			const match = await matcher.match(text, { now: NOW });
			assertNotNull(match);
			expect(match.id).toEqual('orders');
			expect((match.values as any).when).toEqual(when);
		});

		it('Free text is written as it is', async () => {
			expect(await generator.generate('search', { query: 'milk' }))
				.toEqual('Find milk');
		});

		it('Every way of saying it is returned, shortest first', async () => {
			expect(await generator.generateAll('orders'))
				.toEqual([ 'Orders', 'Show Orders' ]);
		});

		it('An intent that was not added throws', async () => {
			await expect(generator.generate('nope' as any)).rejects.toThrow();
		});
	});

	describe('Text that would mean something else', () => {
		const generator = intentsBuilder(en)
			.add('search', newPhrases()
				.value('query', anyTextValue())
				.phrase('Find {query}')
				.build())
			.add('orders', newPhrases()
				.phrase('Find orders')
				.build())
			.buildGenerator();

		it('Is not returned', async () => {
			/*
			 * `Find orders` is the phrase of another intent, so there is no
			 * way to write this search that reads back as a search.
			 */
			expect(await generator.generate('search', { query: 'orders' })).toBeNull();
		});

		it('Does not stop other values from being written', async () => {
			expect(await generator.generate('search', { query: 'milk' }))
				.toEqual('Find milk');
		});
	});

	describe('Values', () => {
		it('Date', async () => {
			expect(await generatorFor(en, dateValue()).generate({ v: LocalDate.of(2010, 2, 22) }, { now: NOW }))
				.toEqual('x 2010-02-22');
		});

		it('Time', async () => {
			expect(await generatorFor(en, timeValue()).generate({ v: LocalTime.of(14, 30) }, { now: NOW }))
				.toEqual('x 14:30');
		});

		it('Time with seconds', async () => {
			expect(await generatorFor(en, timeValue()).generate({ v: LocalTime.of(14, 30, 15) }, { now: NOW }))
				.toEqual('x 14:30:15');
		});

		it('Date and time', async () => {
			const value = LocalDateTime.fromDateAndTime(LocalDate.of(2010, 2, 22), LocalTime.of(14, 30));

			expect(await generatorFor(en, dateTimeValue()).generate({ v: value }, { now: NOW }))
				.toEqual('x 2010-02-22 14:30');
		});

		it('Integer', async () => {
			expect(await generatorFor(en, integerValue()).generate({ v: BigInteger.fromNumber(2400) }))
				.toEqual('x 2400');
		});

		it('Number', async () => {
			expect(await generatorFor(en, numberValue()).generate({ v: BigDecimal.parse('2.4') }))
				.toEqual('x 2.4');
		});

		it('Ordinal', async () => {
			expect(await generatorFor(en, ordinalValue()).generate({ v: BigInteger.fromNumber(3) }))
				.toEqual('x 3');
		});

		it('Boolean', async () => {
			expect(await generatorFor(en, booleanValue()).generate({ v: true }))
				.toEqual('x true');
		});

		it('Enumeration', async () => {
			const value = enumerationValue([
				{ value: 'customers', text: [ 'customers', 'clients' ] },
				'orders'
			]);

			expect(await generatorFor(en, value).generate({ v: 'customers' })).toEqual('x customers');
			expect(await generatorFor(en, value).generate({ v: 'orders' })).toEqual('x orders');
		});

		it('A value that is not in the enumeration is not written', async () => {
			const value = enumerationValue([ 'orders' ]);

			expect(await generatorFor(en, value).generate({ v: 'invoices' })).toBeNull();
		});
	});

	describe('Durations', () => {
		/**
		 * Create a length of time in the shape a match resolves, where the
		 * parts that are not named are left out.
		 *
		 * @param fields -
		 *   the parts of the length of time
		 * @returns
		 *   the length of time
		 */
		const duration = (fields: Partial<MutableDuration>): MutableDuration => {
			const result = new MutableDuration();
			for(const key of Object.keys(result) as (keyof MutableDuration)[]) {
				(result as any)[key] = undefined;
			}

			return Object.assign(result, fields);
		};

		it('Days', async () => {
			expect(await generatorFor(en, dateDurationValue()).generate({ v: duration({ days: 7 }) }))
				.toEqual('x 7 days');
		});

		it('Months', async () => {
			expect(await generatorFor(en, dateDurationValue()).generate({ v: duration({ months: 2 }) }))
				.toEqual('x 2 months');
		});

		it('Hours', async () => {
			expect(await generatorFor(en, timeDurationValue()).generate({ v: duration({ hours: 3 }) }))
				.toEqual('x 3 hours');
		});

		it('The words come from the language', async () => {
			expect(await generatorFor(sv, dateDurationValue()).generate({ v: duration({ days: 7 }) }))
				.toEqual('x 7 dagar');
		});

		it('Days and times together', async () => {
			expect(await generatorFor(en, dateTimeDurationValue()).generate({ v: duration({ days: 2 }) }))
				.toEqual('x 2 days');
		});

		it('More than one part is not written', async () => {
			expect(await generatorFor(en, dateTimeDurationValue()).generate({ v: duration({ days: 2, hours: 3 }) }))
				.toBeNull();
		});

		it('Parts that are left out are the same as parts that are not named', async () => {
			expect(await generatorFor(en, dateDurationValue()).generate({ v: { days: 7 } as any }))
				.toEqual('x 7 days');
		});
	});

	describe('Date intervals', () => {
		const generator = generatorFor(en, dateIntervalValue());

		const generate = (start: LocalDate | null, end: LocalDate | null) => {
			return generator.generate({ v: DateInterval.between(start, end) }, { now: NOW });
		};

		it('A whole year is written as the year', async () => {
			expect(await generate(LocalDate.of(2025, 1, 1), LocalDate.of(2025, 12, 31)))
				.toEqual('x 2025');
		});

		it('A whole month is written as the month and the year', async () => {
			expect(await generate(LocalDate.of(2025, 1, 1), LocalDate.of(2025, 1, 31)))
				.toEqual('x january 2025');
		});

		it('A whole month is written with the days that month has', async () => {
			expect(await generate(LocalDate.of(2024, 2, 1), LocalDate.of(2024, 2, 29)))
				.toEqual('x february 2024');
		});

		it('A single day is written as the date', async () => {
			expect(await generate(LocalDate.of(2025, 3, 4), LocalDate.of(2025, 3, 4)))
				.toEqual('x 2025-03-04');
		});

		it('Anything else is written as a range', async () => {
			expect(await generate(LocalDate.of(2025, 3, 4), LocalDate.of(2025, 4, 15)))
				.toEqual('x 2025-03-04 to 2025-04-15');
		});

		it('An interval with no end is written from its start', async () => {
			expect(await generate(LocalDate.of(2025, 3, 4), null))
				.toEqual('x from 2025-03-04');
		});

		it('An interval with no start is written up to its end', async () => {
			expect(await generate(null, LocalDate.of(2025, 3, 4)))
				.toEqual('x until 2025-03-04');
		});
	});

	describe('Swedish', () => {
		it('A whole month uses the words of the language', async () => {
			const value = DateInterval.between(LocalDate.of(2025, 1, 1), LocalDate.of(2025, 1, 31));

			expect(await generatorFor(sv, dateIntervalValue()).generate({ v: value }, { now: NOW }))
				.toEqual('x januari 2025');
		});

		it('A range uses the words of the language', async () => {
			const value = DateInterval.between(LocalDate.of(2025, 3, 4), LocalDate.of(2025, 4, 15));

			expect(await generatorFor(sv, dateIntervalValue()).generate({ v: value }, { now: NOW }))
				.toEqual('x 2025-03-04 till 2025-04-15');
		});

		it('Numbers are written with the separator of the language', async () => {
			expect(await generatorFor(sv, numberValue()).generate({ v: BigDecimal.parse('2.4') }))
				.toEqual('x 2,4');
		});
	});

	describe('Options', () => {
		const generator = newPhrases()
			.skippable('please')
			.phrase('Show orders, now')
			.toGenerator(en);

		it('Punctuation is written without a space before it', async () => {
			expect(await generator.generate({})).toEqual('Show orders, now');
		});

		it('Casing can be lowered', async () => {
			expect(await generator.generate({}, { casing: 'lower' })).toEqual('show orders, now');
		});

		it('Casing can be a sentence', async () => {
			expect(await generator.generate({}, { casing: 'sentence' })).toEqual('Show orders, now');
		});
	});

	describe('Custom values', () => {
		it('A value without a renderer is not written', async () => {
			const value = customValue<string>(encounter => {
				encounter.match(encounter.text);
			});

			expect(await generatorFor(en, value).generate({ v: 'test' })).toBeNull();
		});

		it('A value with a renderer is written by it', async () => {
			const value = customValue<string>({
				match: encounter => {
					encounter.match(encounter.text.toUpperCase());
				},
				render: v => [ v.toLowerCase() ]
			});

			expect(await generatorFor(en, value).generate({ v: 'TEST' })).toEqual('x test');
		});
	});

	describe('Text that means something else later', () => {
		/*
		 * A generator that writes a value as `today` and reads it back as the
		 * year it is read in, which is what a text that is read relative to
		 * the current time does.
		 */
		const generator = () => new TemplateGenerator(
			en,
			templatesFrom(newPhrases()
				.value('when', dateValue())
				.phrase('due {when}')
				.build()
				.toGraph(en)),
			new Map([ [ 'when', renderer(() => [ 'today' ]) ] ]),
			async (text, options) => ({ when: (options.now as Date).getFullYear() })
		);

		it('Is not written', async () => {
			expect(await generator().generate({ when: 2020 }, { now: NOW }, 1))
				.toEqual([]);
		});

		it('Is written when the caller asks for it', async () => {
			expect(await generator().generate({ when: 2020 }, { now: NOW, stable: false }, 1))
				.toEqual([ 'due today' ]);
		});
	});

	describe('Reading a graph', () => {
		it('Templates are read out of the phrases', () => {
			const templates = templatesFrom(newPhrases()
				.value('when', dateIntervalValue())
				.phrase('[Show] Orders (in|from) {when}')
				.build()
				.toGraph(en));

			expect(templates.map(t => t.values)).toEqual([
				[ 'when' ], [ 'when' ], [ 'when' ], [ 'when' ]
			]);

			expect(templates.map(t => t.words)).toEqual([ 2, 2, 3, 3 ]);
		});

		it('The names of a month are read out of the language', () => {
			const graph = en.findGraph(KnownGraphs.Month);
			const texts = textsFor<DateTimeData>(graph, data => {
				return data.month === 0 && Object.keys(data).length === 1;
			});

			expect(texts).toEqual([ 'jan', 'january' ]);
		});

		it('Words that mean something else later are left out', () => {
			const graph = en.findGraph(KnownGraphs.Month);
			const texts = textsFor<DateTimeData>(graph, () => true);

			expect(texts).not.toContain('this month');
			expect(texts).not.toContain('next month');
		});
	});
});
