'use strict';

const Matcher = require('../matching/matcher');
const CollectorNode = require('../collector');

module.exports.toDot = function(node) {
	if(node instanceof Matcher) {
		return matcherToDot(node);
	}
};

function matcherToDot(self) {

	const iterate = (node, func) => {
		func(node);

		for(const n of node.outgoing) {
			iterate(n, func);
		}
	};

	let result = 'digraph {\nrankdir=LR;\n';

	result += 'collector[shape=diamond,label=""];\n';

	const nodes = new Map();
	iterate(self, node => {
		if(node instanceof CollectorNode) {
			return;
		}

		let id = nodes.get(node);
		if(id) return;

		id = 'node' + nodes.size;
		nodes.set(node, id);

		if(node instanceof Matcher) {
			result += id + '[shape=circle, label=""];\n';
		} else {
			result += id + '[' + node.toDot() + '];\n';
		}
	});

	iterate(self, node => {
		let id = nodes.get(node);
		for(const n of node.outgoing) {
			const id2 = n instanceof CollectorNode ? 'collector' : nodes.get(n);
			result += id + ' -> ' + id2 + ';\n';
		}
	});

	result += '}';
	return result;
}
