declare module 'talisman/tokenizers/words/treebank' {
	export = tokenize;

	function tokenize(input: string): string[];
}
