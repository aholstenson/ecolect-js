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
	public constructor() {
		super();

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
