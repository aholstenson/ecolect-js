import { textRenderer } from '../generation/renderers/text.js';
import { ValueEncounter } from '../resolver/ValueEncounter.js';
import { ValueNodeOptions } from '../resolver/ValueNode.js';

import { ValueMatcher, NodeConvertable } from './base.js';

const instance: ValueNodeOptions<string> = {
	match(encounter: ValueEncounter<string>) {
		encounter.match(encounter.text);
	}
};

export function anyTextValue(options?: Omit<ValueNodeOptions<string>, 'match'>): NodeConvertable<string> {
	return new ValueMatcher(Object.assign({}, options, instance), textRenderer());
}
