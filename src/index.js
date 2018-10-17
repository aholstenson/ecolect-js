
import { Builder as IntentsBuilder } from './intents';
import { Builder as ActionsBuilder } from './actions';

export function intentsBuilder(lang) {
	return new IntentsBuilder(lang);
}

export function actionsBuilder(lang) {
	return new ActionsBuilder(lang);
}
