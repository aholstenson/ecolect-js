# Ecolect

[![npm version](https://badge.fury.io/js/ecolect.svg)](https://badge.fury.io/js/ecolect)
[![CI](https://github.com/aholstenson/ecolect-js/actions/workflows/ci.yml/badge.svg)](https://github.com/aholstenson/ecolect-js/actions/workflows/ci.yml)

Ecolect is a library for JavaScript and TypeScript that helps with matching
natural language phrases and values. This can be used as a part in building a
natural language interface for things such as bots, voice or search interfaces.

## Installation

```
$ npm install ecolect
```

Languages ship with the library, as subpaths such as `ecolect/language/en` for
English and `ecolect/language/sv` for Swedish.

The package is ESM only and needs Node 22 or later. To use it from CommonJS,
load it with a dynamic `import()`.

# Features

* Natural language parsing of different values, such as:
  * Dates and times (via `dateValue`, `timeValue` and `dateTimeValue`)
  * Date intervals (via `dateIntervalValue`)
  * Durations (via `dateDurationValue`, `timeDurationValue` and `dateTimeDurationValue`)
  * Numbers (via `ordinalValue`, `numberValue` and `integerValue`)
* Matching of phrases, including value extraction
* Partial matching of phrases, for auto-complete uses such as action launches
* Ranked matching of everything an expression can mean, for palettes that let
  the user pick between them
* Generating the text an intent and its values would be matched from, for
  links that carry what the user asked for

### Examples

Using a value:

```javascript
import { en } from 'ecolect/language/en';
import { dateValue } from 'ecolect';

const matcher = dateValue().matcher(en);
const bestMatch = await matcher.match('first Monday of 2021');
```

Matching phrases:

```javascript
import { en } from 'ecolect/language/en';
import { newPhrases, dateIntervalValue } from 'ecolect';

const matcher = newPhrases()
  .value('when', dateIntervalValue())
  .phrase('Show todos due {when}')
  .phrase('Todos due {when}')
  .toMatcher(en);

const bestMatch = await matcher.match('todo due today');
```

Combining phrases:

```javascript
import { en } from 'ecolect/language/en';
import { intentsBuilder, newPhrases, dateIntervalValue } from 'ecolect';

const matcher = intentsBuilder(en)
  .add('orders', newPhrases()
    .phrase('Orders')
    .phrase('Show orders')
    .build()
  )
  .add('orders:active', newPhrases()
    .phrase('Orders that are active')
    .phrase('Show orders that are active')
    .build()
  )
  .build();

const bestMatch = await matcher.match('orders');

// Or partially match
const matches = await matcher.matchPartial('orders');
```

An expression can mean more than one thing. `matchAll` returns everything that
matches the whole expression, best match first, so that the user can pick
between them:

```javascript
import { anyTextValue } from 'ecolect';

const matcher = intentsBuilder(en)
  .add('orders', newPhrases()
    .value('customer', anyTextValue())
    .phrase('Orders for {customer}')
    .build()
  )
  .add('search', newPhrases()
    .value('query', anyTextValue())
    .phrase('Find {query}')
    .build()
  )
  .build();

// [ orders for the customer `Test`, a search for `orders for Test` ]
const matches = await matcher.matchAll('find orders for Test');

// The number of matches can be limited, keeping the best ones
const bestTwo = await matcher.matchAll('find orders for Test', { limit: 2 });
```

Every match has a `score`, and matches that mean the same thing are returned
once. Use `matchAll` when the user has entered a full expression and
`matchPartial` while they are still typing.

Words that only make sense for certain phrases can be marked as skippable on
those phrases:

```javascript
const matcher = newPhrases()
  .skippable('please', 'all', 'my')
  .phrase('Show orders')
  .toMatcher(en);

// Matches, as `please`, `all` and `my` may be left out
const bestMatch = await matcher.match('please show all my orders');
```

### Groups of alternatives

A phrase can describe several ways to say the same thing. Words within `(` and
`)` must match, words within `[` and `]` may also be left out, and `|`
separates the alternatives:

```javascript
const matcher = newPhrases()
  .value('when', dateIntervalValue())
  .phrase('[Show|List] orders (from|in) {when}')
  .toMatcher(en);

// All of these match
await matcher.match('show orders from today');
await matcher.match('list orders in January');
await matcher.match('orders from today');
```

Alternatives are text, so they may contain both several words and values:

```javascript
newPhrases()
  .value('customer', anyTextValue())
  .phrase('Orders (for|belonging to) {customer}')
  .phrase('Order[s] (today|{when})')
```

Groups can not contain other groups.

## Generating text

A matcher turns text into an intent and its values. A generator turns them
back into text. Use it when the values have been stored somewhere, such as in
the query parameters of a page, and the user should see what they asked for:

```javascript
import { DateInterval, LocalDate } from 'datetime-types';
import { en } from 'ecolect/language/en';
import { intentsBuilder, newPhrases, dateIntervalValue } from 'ecolect';

const builder = intentsBuilder(en)
  .add('orders', newPhrases()
    .value('when', dateIntervalValue())
    .phrase('[Show] Orders')
    .phrase('[Show] Orders (in|from) {when}')
    .build()
  );

const matcher = builder.build();
const generator = builder.buildGenerator();

// `Orders in 2025`
const text = await generator.generate('orders', {
  when: DateInterval.between(LocalDate.of(2025, 1, 1), LocalDate.of(2025, 12, 31))
});
```

A single set of phrases has a generator of its own, in the same way it has a
matcher:

```javascript
const generator = newPhrases()
  .value('when', dateIntervalValue())
  .phrase('Todos due {when}')
  .toGenerator(en);

const text = await generator.generate({ when: interval });
```

The shortest way of saying something is generated. `generateAll` returns every
way the phrases allow, shortest first, for letting a user pick between them.

### What is guaranteed

Every text is read back before it is returned, and only text that resolves to
the intent and values it was written for is handed to the caller. This means:

* **Text always means what it says.** A search for `orders` is not written as
  `Find orders` when another intent matches that phrase better. There is no
  way to generate a link that opens something else.
* **Text keeps meaning it later.** A text that resolves to another value when
  it is read at another time, such as `today`, is not generated. Set
  `stable: false` to allow it.
* **A value that can not be written is not guessed at.** `generate` returns
  `null`, and the caller can fall back to a plain link.

### Options

Option          | Default    | Description
----------------|------------|-------------
`stable`        | `true`     | Only generate text that means the same thing whenever it is read
`casing`        | `phrase`   | How to write the words of the phrase, one of `phrase`, `lower` or `sentence`
`maxCandidates` | `25`       | The number of texts to try before giving up

The options of a match, such as `locale` and `now`, are also accepted and are
used both while writing the text and while reading it back. Generate with the
locale the text will be read with, as `1/2/2017` is not the same date in every
locale.

### What can be written

Every value type can be written except `customValue`, which needs a `render`
of its own:

```javascript
customValue({
  match: encounter => encounter.match(lookUp(encounter.text)),

  // Return every way of writing the value, best way first
  render: value => [ value.name ]
});
```

Dates are written as `2010-02-22` and times as `14:00`, which every language
reads the same way. Date intervals are written as short as they can be, so a
whole year becomes `2025` and a whole month becomes `january 2025`. Anything
else becomes a range between two dates.

The words for months, for joining the two dates of a range, and for the parts
of a length of time are read out of the graphs of the language, so a language
that is added later can be written without listing its words again. A length
of time that names more than one part, such as two days and three hours, is
not written.

`casing` changes the words of the phrase only. A value keeps the case it is
written with, so a name is not changed.

Pass the values as a match resolved them. A field that is left out is the same
as a field that is not set, so `{ days: 7 }` is a length of time of seven
days.

## Vocabulary

Languages understand common words, but not the words of your domain. Use
`withVocabulary` to get a language that also reads words you specify. The
language it is called on is left unchanged, so several vocabularies can be
used side by side:

```javascript
import { en } from 'ecolect/language/en';
import { newPhrases } from 'ecolect';

const language = en.withVocabulary({
  // Words that mean the same thing, keyed by the word to read them as
  synonyms: {
    customers: [ 'clients', 'accounts' ]
  },

  // Words that may be left out of the input
  skippable: [ 'please' ]
});

const matcher = newPhrases()
  .phrase('Show customers')
  .toMatcher(language);

// All of these match
await matcher.match('show customers');
await matcher.match('show clients');
await matcher.match('please show accounts');
```

Synonyms work in both directions, so a phrase may be written with any of the
words in a group. Every word in a vocabulary must be a single word.

## Locale

A language decides which words are understood. A locale decides the
conventions of the person writing the expression, such as whether `1/2/2017`
is January 2nd or February 1st and which day weeks start on. `en-GB` and
`en-US` share a language but not these conventions.

Set the locale on the language to use it for every match:

```javascript
import { english } from 'ecolect/language/en';
import { dateValue } from 'ecolect';

const matcher = dateValue().matcher(english('en-GB'));

// February 1st, as `en-GB` writes the day before the month
const match = await matcher.match('1/2/2017');
```

Or set it for a single match, which is what a server that answers several
people at once needs:

```javascript
const match = await matcher.match('1/2/2017', { locale: 'en-GB' });
```

The conventions are read from `Intl`, so no locale data is bundled. Read them
directly with `resolveLocale` if you need them yourself:

```javascript
import { resolveLocale } from 'ecolect/language';

// { dateOrder: 'day-month-year', weekStartsOn: 1, firstWeekContainsDate: 4, ... }
const settings = resolveLocale('en-GB');
```

English reads expressions as `en-US` when no locale is given, and Swedish reads
them as `sv-SE`.

Swedish uses `swedish` the same way English uses `english`:

```javascript
import { swedish } from 'ecolect/language/sv';

const matcher = dateValue().matcher(swedish('sv-FI'));
```

## Options

Option                  | Default             | Description
------------------------|---------------------|-------------
`now`                   | `new Date()`        | Date to use as a base for times and dates parsed
`locale`                | Locale of the language | The locale to read the expression as, such as `en-GB`
`dateOrder`             | From the locale     | The order of the fields in a numeric date such as `1/2/2017`
`weekStartsOn`          | From the locale     | The day the week starts on
`firstWeekContainsDate` | From the locale     | The day of January which is always in the first week of the year

An option set directly wins over the locale, so `dateOrder` given together
with a locale is used as it is.

### A note about weeks

Countries do not agree on which day a week starts on or on which week is the
first week of the year, so a week number can mean two different dates. Setting
the locale is the shortest way to get this right, but the two settings can
also be given on their own.

`weekStartsOn` is `0` for weeks that start on Sunday, which North America,
India, Japan, Israel, Egypt, South Africa, the Philippines and most of Latin
America use. It is `1` for weeks that start on Monday, which the EU, most of
Asia and Oceania use, and `6` for weeks that start on Saturday, which is
common in the Middle East.

`firstWeekContainsDate` is `1` when the first week of the year is the one with
January 1st in it, and `4` for the ISO week system, where the first week is
the first one with at least four days in it. Europe uses the ISO system and
North America does not.

For more information about week numbering see the [Week article on Wikipedia](https://en.wikipedia.org/wiki/Week#Week_numbering).

## Value types

### Integer

```javascript
import { integerValue } from 'ecolect';

const value = integerValue();
```

Capture any positive integer number.

Language         | Examples
-----------------|-------------
English          | `20`, `zero`, `one million`, `4 000`, `1 dozen`, `100k`
Swedish          | `20`, `noll`, `en miljon`, `4 000`, `1 dussin`, `100k`

#### Returned value

The returned value is a `BigInteger` from [numeric-types](https://github.com/aholstenson/numeric-types).

### Number

```javascript
import { numberValue } from 'ecolect';

const value = numberValue();
```

Capture any number, including numbers with a fractional element.

Language         | Examples
-----------------|-------------
English          | `20`, `2.4 million`, `8.0`, `-12`
Swedish          | `20`, `2,4 miljoner`, `8,0`, `-12`

#### Returned value

The returned value is a `BigDecimal` from [numeric-types](https://github.com/aholstenson/numeric-types).

### Ordinal

```javascript
import { ordinalValue } from 'ecolect';

const value = ordinalValue();
```

Capture an ordinal, such as `1st`, indicating a position.

Language         | Examples
-----------------|-------------
English          | `1st`, `third`, `3`, `the fifth`
Swedish          | `1:a`, `tredje`, `3`, `den femte`

#### Returned value

The returned value is a `BigInteger` from [numeric-types](https://github.com/aholstenson/numeric-types).

### Date

```javascript
import { dateValue } from 'ecolect';

const value = dateValue();
```

Capture a date representing a single day.

Language         | Examples
-----------------|-------------
English          | `today`, `in 2 days`, `january 12th`, `2010-02-22`, `02/22/2010`, `first friday in 2020`
Swedish          | `idag`, `om 2 dagar`, `12 januari`, `2010-02-22`, `första fredagen 2020`

#### Returned value

The returned value is a `LocalDate` from [datetime-types](https://github.com/aholstenson/datetime-types).

### Time

```javascript
import { timeValue } from 'ecolect';

const value = timeValue();
```

Capture a time of day.

Language         | Examples
-----------------|-------------
English          | `09:00`, `3 pm`, `at 3:30 am`, `noon`, `quarter to twelve`, `in 2 hours`, `in 45 minutes`
Swedish          | `09:00`, `14.30`, `kl 15`, `midnatt`, `kvart i tolv`, `halv tolv`, `om 2 timmar`

#### Returned value

The returned value is a `LocalTime` from [datetime-types](https://github.com/aholstenson/datetime-types).

### Date & Time

```javascript
import { dateTimeValue } from 'ecolect';

const value = dateTimeValue();
```

Capture both a date and a time.

Language         | Examples
-----------------|-------------
English          | `3pm on Jan 12th`, `in 2 days and 2 hours`, `14:00`
Swedish          | `kl 15 den 12 januari`, `om 2 dagar och 2 timmar`, `14:00`

#### Returned value

The returned value is a `LocalDateTime` from [datetime-types](https://github.com/aholstenson/datetime-types).

### Date Interval

```javascript
import { dateIntervalValue } from 'ecolect';

const value = dateIntervalValue();
```

Capture an interval between two dates.

Language         | Examples
-----------------|-------------
English          | `today`, `this month`, `February to March`, `2018-01-01 to 2018-04-05`, `January 15th - 18th`
Swedish          | `idag`, `denna månad`, `februari till mars`, `2018-01-01 till 2018-04-05`, `de senaste 7 dagarna`

#### Returned value

The returned value is a `DateInterval` from [datetime-types](https://github.com/aholstenson/datetime-types).

### Date Duration

```javascript
import { dateDurationValue } from 'ecolect';

const value = dateDurationValue();
```

Capture a duration.

Language         | Examples
-----------------|-------------
English          | `2 days`, `2m, 1d`, `1 year and 2 days`, `4y 2m`, `1 week`
Swedish          | `2 dagar`, `2 m, 1 d`, `1 år och 2 dagar`, `4 v 2 d`, `en vecka`

#### Returned value

### Time Duration

```javascript
import { timeDurationValue } from 'ecolect';

const value = timeDurationValue();
```

Capture a duration of hours, minutes, seconds and miliseconds.

Language         | Examples
-----------------|-------------
English          | `2 hours`, `1s`, `2h, 45m`, `4 minutes and 10 seconds`
Swedish          | `2 timmar`, `1 s`, `2 h 45 min`, `4 minuter och 10 sekunder`

#### Returned value

### Date & Time Duration

```javascript
import { dateTimeDurationValue } from 'ecolect';

const value = dateTimeDurationValue();
```

Capture a duration of both days, hours, minutes, seconds and miliseconds.

Language         | Examples
-----------------|-------------
English          | `2 hours`, `2 d 20 m`, `4 weeks and 10 minutes`
Swedish          | `2 timmar`, `2 d 20 min`, `4 veckor och 10 minuter`

#### Returned value

### Enumeration

```javascript
import { enumerationValue } from 'ecolect';

const value = enumerationValue([
  'Option 1',
  'Other option'
]);
```

Capture one of the specified values. Used to specify one or more values that
should match.

A value that can be said in more than one way is given as an entry with its
own text. Every text resolves to the same value:

```javascript
const value = enumerationValue([
  { value: 'customers', text: [ 'customers', 'clients', 'accounts' ] },
  { value: 'orders', text: 'orders' }
]);
```

Entries and plain values can be mixed. When values are mapped to text the
mapper may also return several texts:

```javascript
const value = enumerationValue(
  companies,
  company => [ company.name, company.shortName ]
);
```

### Text

```javascript
import { anyTextValue } from 'ecolect';

const value = anyTextValue();
```

Text can be captured with the type `anyTextValue`. You can use `anyTextValue`
for things such as search queries, todo items and calendar events. Values of
type `anyTextValue` will always try to capture as much as they can and will not
validate the result.

## Entry points

Everything ships in the `ecolect` package. Import only the parts you need, so
a bundler can leave the rest out.

Import | Description
-------|------------
`ecolect` | Intents, actions and the value types
`ecolect/values` | The value types on their own
`ecolect/matching` | Match options and matcher interfaces
`ecolect/language/en` | English language support
`ecolect/language/sv` | Swedish language support
`ecolect/language/loader` | Load a language on demand
`ecolect/language` | Shared language interfaces
`ecolect/graph` | Graph based matching over tokens
`ecolect/tokenization` | Tokenization of strings
`ecolect/type-datetime` | Date and time primitives
`ecolect/type-numbers` | Number primitives

### Loading a language on demand

Import a language directly when you know which one you need when you write the
code. When the language is only known while the program runs, load it through
`ecolect/language/loader`:

```javascript
import { loadLanguage } from 'ecolect/language/loader';
import { dateValue } from 'ecolect';

const language = await loadLanguage('en');
const matcher = dateValue().matcher(language);
```

The loader holds one literal `import()` per language. A bundler reads those and
puts every language in a chunk of its own, so a page that only ever loads
English never downloads the others.

## Development

Install [pnpm](https://pnpm.io) and then:

```
$ pnpm install
$ pnpm build
$ pnpm test
```

Command | Description
--------|------------
`pnpm build` | Generate the Unicode matchers and compile `src` to `dist`
`pnpm test` | Run the test suite once with Vitest
`pnpm test:watch` | Run the test suite in watch mode
`pnpm coverage` | Run the test suite and report coverage
`pnpm typecheck` | Type check the sources and the tests
`pnpm lint` | Run ESLint
`pnpm apidocs` | Build the API documentation into `apidocs`

Tests import the sources directly, so `pnpm test` does not need a build first.

`dist` carries the compiled JavaScript and the type declarations, and nothing
else. No source maps or TypeScript sources are published, which keeps the
package about a third of the size it would otherwise be.

### Running the examples

`examples` holds runnable programs that use the package the way an application
would. They import `ecolect` from `dist`, so build first:

```
$ pnpm install
$ pnpm build
$ pnpm --filter @ecolect/examples run intent-matching
```

Command | Description
--------|------------
`pnpm --filter @ecolect/examples run intent-matching` | Match intents and read the captured values
`pnpm --filter @ecolect/examples run direct-value-usage` | Use a value type on its own, without phrases
`pnpm --filter @ecolect/examples run command-line-client` | Type an expression and pick between the intents it can still become

The command line client needs a terminal. Pick a suggestion with Enter and
quit with Ctrl+C.

## Releases

Releases are prepared by [Release Please](https://github.com/googleapis/release-please),
which reads the [Conventional Commits](https://www.conventionalcommits.org)
history and opens a pull request that raises the versions and writes the
changelogs. Merging that pull request tags the release, and the `Release`
workflow publishes the package to npm.

`release-please-config.json` carries `"release-as": "0.8.0"` to set the version
of the first release after the move to ESM. Remove that field once 0.8.0 is
published, so that later versions follow from the commit history again.
