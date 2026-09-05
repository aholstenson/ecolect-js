import { RenderContext, renderer } from '../generation/ValueRenderer.js';
import { ValueEncounter } from '../resolver/ValueEncounter.js';
import { ValueNodeOptions } from '../resolver/ValueNode.js';

import { ValueMatcher, NodeConvertable } from './base.js';

/**
 * Options for a custom value.
 */
export interface CustomValueOptions<V> extends ValueNodeOptions<V> {
	/**
	 * Write the value as the text it would be matched from. Return every way
	 * the value can be written, best way first. A way of writing the value
	 * that does not read back as it is dropped, so this does not have to be
	 * exact.
	 *
	 * @param value -
	 *   the value to write
	 * @param context -
	 *   what is known about the text being written
	 * @returns
	 *   the ways the value can be written, best way first
	 */
	render?: (value: V, context: RenderContext) => string[] | Promise<string[]>;
}

/**
 * Create a custom value that performs its own parsing of a raw textual value.
 *
 * @param options
 */
export function customValue<V>(options: CustomValueOptions<V> | ((encounter: ValueEncounter<V>) => Promise<void> | void)): NodeConvertable<V> {
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

	/*
	 * How the value is written is not part of how it is matched, so it is
	 * kept out of the options the node is given.
	 */
	const { render, ...nodeOptions } = options;

	return new ValueMatcher<V>(nodeOptions, render ? renderer(render) : undefined);
}
