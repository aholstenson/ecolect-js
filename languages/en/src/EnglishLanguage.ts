import { booleanGraph } from './booleanGraph';
import { dateDurationGraph } from './dateDurationGraph';
import { dateGraph } from './dateGraph';
import { dateIntervalGraph } from './dateIntervalGraph';
import { dateTimeDurationGraph } from './dateTimeDurationGraph';
import { dateTimeGraph } from './dateTimeGraph';
import { dayOfWeekGraph } from './dayOfWeekGraph';
import { integerGraph } from './integerGraph';
import { MinimalEnglishLanguage } from './MinimalEnglishLanguage';
import { monthGraph } from './monthGraph';
import { numberGraph } from './numberGraph';
import { ordinalGraph } from './ordinalGraph';
import { quarterGraph } from './quarterGraph';
import { timeDurationGraph } from './timeDurationGraph';
import { timeGraph } from './timeGraph';
import { weekGraph } from './weekGraph';
import { yearGraph } from './yearGraph';

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
