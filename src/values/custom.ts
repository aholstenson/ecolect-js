import { ValueEncounter } from '../resolver/ValueEncounter.js';
import { ValueNodeOptions } from '../resolver/ValueNode.js';

import { ValueMatcher, NodeConvertable } from './base.js';

/**
 * Create a custom value that performs its own parsing of a raw textual value.
 *
 * @param options
 */
export function customValue<V>(options: ValueNodeOptions<V> | ((encounter: ValueEncounter<V>) => Promise<void> | void)): NodeConvertable<V> {
	if(typeof options === 'undefined') {
		throw new Error('Value matcher must be specified');
	}

	if(typeof options === 'function') {
		const func = options;
		options = {
			match: func
		};
	}

	if(typeof options.match !== 'function') {
		throw new Error('options.match must be a function');
	}

	return new ValueMatcher(options);
}
