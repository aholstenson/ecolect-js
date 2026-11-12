import type { Language, LanguageOptions } from '../index.js';

import { booleanGraph } from './booleanGraph.js';
import { dateDurationGraph } from './dateDurationGraph.js';
import { dateGraph } from './dateGraph.js';
import { dateIntervalGraph } from './dateIntervalGraph.js';
import { dateTimeDurationGraph } from './dateTimeDurationGraph.js';
import { dateTimeGraph } from './dateTimeGraph.js';
import { dayOfWeekGraph } from './dayOfWeekGraph.js';
import { integerGraph } from './integerGraph.js';
import { MinimalSwedishLanguage } from './MinimalSwedishLanguage.js';
import { monthGraph } from './monthGraph.js';
import { numberGraph } from './numberGraph.js';
import { ordinalGraph } from './ordinalGraph.js';
import { quarterGraph } from './quarterGraph.js';
import { timeDurationGraph } from './timeDurationGraph.js';
import { timeGraph } from './timeGraph.js';
import { weekGraph } from './weekGraph.js';
import { yearGraph } from './yearGraph.js';

export class SwedishLanguage extends MinimalSwedishLanguage {
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

export const sv = new SwedishLanguage();

/**
 * Get Swedish read as the given locale, such as `sv-FI`. The words understood
 * are the same for every locale, only the conventions change, so the returned
 * language shares its graphs with {@link sv}.
 *
 * ```javascript
 * const matcher = dateValue().matcher(swedish('sv-FI'));
 * ```
 *
 * The locale can also be `auto`, to read it from the JavaScript runtime, or
 * settings as plain data:
 *
 * ```javascript
 * const language = swedish({ locale: 'auto', region: 'SE', weekStartsOn: 'monday' });
 * ```
 *
 * @param locale -
 *   the locale to read expressions as, as a BCP 47 language tag, `auto`, or
 *   the settings of the language
 * @param options -
 *   options used for every match that does not set them, such as
 *   `{ numberSeparators: 'lenient' }`
 * @returns
 *   Swedish read as the given locale
 */
export function swedish(locale: string | LanguageOptions, options?: LanguageOptions): Language {
	return typeof locale === 'string'
		? sv.withLocale(locale, options)
		: sv.withSettings(locale);
}
