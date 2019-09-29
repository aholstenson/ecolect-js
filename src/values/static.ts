import { ValueStatic } from '../resolver/ValueStatic';

export function staticValue<V>(id: string, value: V) {
	return new ValueStatic<V>(id, value);
}
