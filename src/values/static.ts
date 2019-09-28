import { ValueStatic } from '../resolver/value-static';

export function staticValue<V>(id: string, value: V) {
	return new ValueStatic<V>(id, value);
}
