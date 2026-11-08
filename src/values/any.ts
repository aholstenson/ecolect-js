import { textRenderer } from '../generation/renderers/text.js';
import type { ValueEncounter } from '../resolver/ValueEncounter.js';
import type { ValueNodeOptions } from '../resolver/ValueNode.js';

import type { NodeConvertable } from './base.js';
import { ValueMatcher } from './base.js';

const instance: ValueNodeOptions<string> = {
	anyText: true,

	match(encounter: ValueEncounter<string>) {
		encounter.match(encounter.text);
	}
};

export function anyTextValue(options?: Omit<ValueNodeOptions<string>, 'match'>): NodeConvertable<string> {
	return new ValueMatcher(Object.assign({}, options, instance), textRenderer());
}
