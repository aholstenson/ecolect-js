import { DateInterval, LocalDate } from 'datetime-types';
import { en } from 'ecolect/language/en';
import { dateIntervalValue, intentsBuilder, newPhrases } from 'ecolect';

/*
 * A page that is navigated to as `Orders in 2025` keeps what was asked for in
 * its address. Matching turns the text into an intent and its values on the
 * way in, and generating turns them back into text on the way out, so the
 * page can show what it is listing.
 */
const builder = intentsBuilder(en)
	.add('orders', newPhrases()
		.value('when', dateIntervalValue())
		.phrase('[Show] Orders')
		.phrase('[Show] Orders (in|from) {when}')
		.build()
	)
	.add('orders:customer', newPhrases()
		.value('when', dateIntervalValue())
		.phrase('Orders for customers (in|from) {when}')
		.build()
	);

const matcher = builder.build();
const generator = builder.buildGenerator();

// What the user typed becomes an intent and its values
const match = await matcher.match('orders in 2025');
console.log('Intent:', match?.id);
console.log('Values:', match?.values);

// Which are written back out as the text of a link
console.log('Written back:', await generator.generate(match.id, match.values));

// Values that were never typed are written just as well
const march = DateInterval.between(LocalDate.of(2025, 3, 1), LocalDate.of(2025, 3, 31));
console.log('A whole month:', await generator.generate('orders', { when: march }));

const range = DateInterval.between(LocalDate.of(2025, 3, 4), LocalDate.of(2025, 4, 15));
console.log('A range:', await generator.generate('orders', { when: range }));

// Every way of saying it, for letting the user pick
console.log('Every way:', await generator.generateAll('orders', { when: march }));
