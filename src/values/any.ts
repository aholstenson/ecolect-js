import { ValueMatcher } from './base';
import { ValueNodeOptions, ValueEncounter } from '../resolver/value';

const instance: ValueNodeOptions<string> = {
	async match(encounter: ValueEncounter<string>) {
		encounter.match(encounter.text());
	}
};

export function anyStringValue(options?: Omit<ValueNodeOptions<string>, 'match'>) {
	return new ValueMatcher(Object.assign({}, options, instance));
}
