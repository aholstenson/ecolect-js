import ValueStatic from '../resolver/value-static';

export default function(id, value) {
	return new ValueStatic(id, value);
}
