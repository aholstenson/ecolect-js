import { Language } from './language/Language';

import { IntentsBuilder } from './IntentsBuilder';
import { ActionsBuilder } from './ActionsBuilder';

export * from './IntentsBuilder';
export * from './ActionsBuilder';

export function intentsBuilder(lang: Language) {
	return new IntentsBuilder(lang);
}

export function actionsBuilder(lang: Language) {
	return new ActionsBuilder(lang);
}
