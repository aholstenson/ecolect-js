import { en } from '../src/language/en';
import { booleanValue } from '../src/values';

describe('Value: Matchers', () => {

	it('Can parse string', () => {
		const matcher = booleanValue().matcher(en);
		return matcher.match('yes')
			.then(v => expect(v).toEqual(true));
	});

	it('Can handle invalid value', () => {
		const matcher = booleanValue().matcher(en);
		return matcher.match('cookies')
			.then(v => expect(v).toEqual(null));
	});

});
