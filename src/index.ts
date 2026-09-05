
import { ActionsBuilder } from './ActionsBuilder.js';
import { IntentsBuilder } from './IntentsBuilder.js';
import { Language } from './language/index.js';

export * from './generation/index.js';
export * from './matching/index.js';
export * from './resolver/expression/index.js';

export * from './resolver/Phrases.js';
export * from './resolver/newPhrases.js';
export * from './resolver/PhrasesBuilder.js';

export * from './values/index.js';

export * from './IntentsBuilder.js';
export * from './ActionsBuilder.js';

export function intentsBuilder(lang: Language) {
	return new IntentsBuilder(lang);
}

export function actionsBuilder<Context, ReturnType>(lang: Language) {
	return new ActionsBuilder<Context, ReturnType>(lang);
}
