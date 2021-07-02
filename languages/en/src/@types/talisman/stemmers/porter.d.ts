declare module 'talisman/stemmers/porter' {
	export = stem;

	function stem(input: string): string;
}
