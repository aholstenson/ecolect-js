import { ValueMatcher, NodeConvertable } from './base.js';
import { ValueNodeOptions } from '../resolver/ValueNode.js';
import { ValueEncounter } from '../resolver/ValueEncounter.js';

const instance: ValueNodeOptions<string> = {
	async match(encounter: ValueEncounter<string>) {
		encounter.match(encounter.text);
	}
};

export function anyTextValue(options?: Omit<ValueNodeOptions<string>, 'match'>): NodeConvertable<string> {
	return new ValueMatcher(Object.assign({}, options, instance));
}
