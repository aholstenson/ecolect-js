import { Language } from './language/Language';

import { IntentsBuilder } from './IntentsBuilder';
import { ActionsBuilder } from './ActionsBuilder';

export {
	Matcher,
	MatchOptions
} from './graph/matching';

export * from './IntentsBuilder';
export * from './ActionsBuilder';

export function intentsBuilder(lang: Language) {
	return new IntentsBuilder(lang);
}

export function actionsBuilder<Context, ReturnType>(lang: Language) {
	return new ActionsBuilder<Context, ReturnType>(lang);
}
