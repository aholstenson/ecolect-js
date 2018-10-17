import { ValueMatcher } from './base';

const instance = {
	match(encounter) {
		encounter.match(encounter.text());
	}
};

export default function(options) {
	return new ValueMatcher(Object.assign({}, options, instance));
}
