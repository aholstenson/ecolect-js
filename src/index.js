import { IntentsBuilder } from './intents';
import { ActionsBuilder } from './actions';

export * from './intents';
export * from './actions';

export function intentsBuilder(lang) {
	return new IntentsBuilder(lang);
}

export function actionsBuilder(lang) {
	return new ActionsBuilder(lang);
}
