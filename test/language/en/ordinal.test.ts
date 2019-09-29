import { testRunner } from '../helpers';

import { en } from '../../../src/language/en';
import { ordinalGraph } from '../../../src/language/en/ordinalGraph';
import { mapOrdinal } from '../../../src/numbers/ordinals';

const test = testRunner(en, ordinalGraph, mapOrdinal);

describe('English', function() {

	describe('Ordinal', function() {
		test('1', {}, { value: 1 });

		test('1st', {}, { value: 1 });

		test('2 1st', {}, { value: 21 });

		test('stuff st', {}, null);
	});

});
