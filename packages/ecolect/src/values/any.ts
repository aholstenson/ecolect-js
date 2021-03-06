import { ValueMatcher, NodeConvertable } from './base';
import { ValueNodeOptions } from '../resolver/ValueNode';
import { ValueEncounter } from '../resolver/ValueEncounter';

const instance: ValueNodeOptions<string> = {
	async match(encounter: ValueEncounter<string>) {
		encounter.match(encounter.text);
	}
};

export function anyTextValue(options?: Omit<ValueNodeOptions<string>, 'match'>): NodeConvertable<string> {
	return new ValueMatcher(Object.assign({}, options, instance));
}
