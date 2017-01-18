'use strict';

function mergeToken(a, b) {
	Object.keys(b).forEach(key => {
		a[key] = b[key];
	});
	return a;
}

/**
 * Tokenize the input on white
 */
module.exports.tokenize = function(text, transformer) {
	let result = [];

	const NON_SPACE = /\S+/gu;
	let match;
	while((match = NON_SPACE.exec(text))) {
		const index = match.index;
		const raw = match[0];

		const tokens = transformer(raw);
		if(Array.isArray(tokens)) {
			// The transformer split the token
			for(let i=0; i<tokens.length; i++) {
				let token;
				if(i == 0) {
					token = {
						start: index,
						stop: index + raw.length,
						raw: raw
					};
				} else {
					token = {
						start: index + raw.length,
						stop: index + raw.length,
						raw: ''
					};
				}

				result.push(mergeToken(token, tokens[i]));
			}
		} else if(tokens) {
			result.push(mergeToken({
				start: index,
				stop: index + raw.length,
				raw: raw
			}, tokens));
		}
	}

	return result;
};

module.exports.raw = function(tokens) {
	let result = [];
	let index = tokens[0].start;
	for(let i=0; i<tokens.length; i++) {
		const token = tokens[i];

		for(let j=index; j<token.start; j++) {
			result.push(' ');
		}
		index = token.stop;

		result.push(token.raw);
	}

	return result.join('');
};

module.exports.raw = function(tokens) {
	let result = [];
	let index = tokens[0].start;
	for(let i=0; i<tokens.length; i++) {
		const token = tokens[i];

		for(let j=index; j<token.start; j++) {
			result.push(' ');
		}
		index = token.stop;

		result.push(token.raw);
	}

	return result.join('');
};
