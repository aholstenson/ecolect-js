import { isLanguageId, languageIds, loadLanguage } from '../../src/language/loader.js';

describe('Language loader', function() {
	it('Lists the languages that ship with the library', function() {
		expect(languageIds).toEqual([ 'en', 'sv' ]);
	});

	it('Knows the identifier of a language it can load', function() {
		expect(isLanguageId('sv')).toBe(true);
	});

	it('Does not know the identifier of a language it can not load', function() {
		expect(isLanguageId('de')).toBe(false);
	});

	it('Loads English', async function() {
		const language = await loadLanguage('en');
		expect(language.id).toEqual('en');
		expect(language.locale).toEqual('en-US');
	});

	it('Loads Swedish', async function() {
		const language = await loadLanguage('sv');
		expect(language.id).toEqual('sv');
		expect(language.locale).toEqual('sv-SE');
	});
});
