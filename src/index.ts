import { Language } from './language/language';

import { IntentsBuilder } from './intents';
import { ActionsBuilder } from './actions';

export * from './intents';
export * from './actions';

export function intentsBuilder(lang: Language) {
	return new IntentsBuilder(lang);
}

export function actionsBuilder(lang: Language) {
	return new ActionsBuilder(lang);
}
