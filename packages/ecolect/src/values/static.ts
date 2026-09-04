import { ValueStatic } from '../resolver/ValueStatic.js';

export function staticValue<V>(id: string, value: V) {
	return new ValueStatic<V>(id, value);
}
