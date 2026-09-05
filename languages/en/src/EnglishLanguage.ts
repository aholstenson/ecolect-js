import { Language } from '@ecolect/language';

import { booleanGraph } from './booleanGraph.js';
import { dateDurationGraph } from './dateDurationGraph.js';
import { dateGraph } from './dateGraph.js';
import { dateIntervalGraph } from './dateIntervalGraph.js';
import { dateTimeDurationGraph } from './dateTimeDurationGraph.js';
import { dateTimeGraph } from './dateTimeGraph.js';
import { dayOfWeekGraph } from './dayOfWeekGraph.js';
import { integerGraph } from './integerGraph.js';
import { MinimalEnglishLanguage } from './MinimalEnglishLanguage.js';
import { monthGraph } from './monthGraph.js';
import { numberGraph } from './numberGraph.js';
import { ordinalGraph } from './ordinalGraph.js';
import { quarterGraph } from './quarterGraph.js';
import { timeDurationGraph } from './timeDurationGraph.js';
import { timeGraph } from './timeGraph.js';
import { weekGraph } from './weekGraph.js';
import { yearGraph } from './yearGraph.js';

export class EnglishLanguage extends MinimalEnglishLanguage {
	public constructor(locale?: string) {
		super(locale);

		this.graph(integerGraph);
		this.graph(numberGraph);
		this.graph(ordinalGraph);
		this.graph(booleanGraph);

		this.graph(dayOfWeekGraph);
		this.graph(yearGraph);
		this.graph(quarterGraph);
		this.graph(monthGraph);
		this.graph(weekGraph);
		this.graph(dateDurationGraph);
		this.graph(dateGraph);

		this.graph(timeDurationGraph);
		this.graph(timeGraph);

		this.graph(dateTimeDurationGraph);
		this.graph(dateTimeGraph);

		this.graph(dateIntervalGraph);
	}
}

export const en = new EnglishLanguage();

/**
 * Get English read as the given locale, such as `en-GB`. The words understood
 * are the same for every locale, only the conventions change, so the returned
 * language shares its graphs with {@link en}.
 *
 * ```javascript
 * const matcher = dateValue().matcher(english('en-GB'));
 *
 * // February 1st, as `en-GB` writes the day first
 * const match = await matcher.match('1/2/2017');
 * ```
 *
 * @param locale -
 *   the locale to read expressions as, as a BCP 47 language tag
 * @returns
 *   English read as the given locale
 */
export function english(locale: string): Language {
	return en.withLocale(locale);
}
