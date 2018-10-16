'use strict';

const GraphBuilder = require('../graph/builder');
const { LanguageSpecificValue, ParsingValue } = require('./index');
const ResolverBuilder = require('../resolver/builder');

class Builder {
	constructor(options) {
		this.name = options.name;
		this.options = options;
		this.data = {};
	}

	option(id) {
		if(typeof id !== 'string') {
			throw new Error('Options require identifiers that are strings');
		}

		const result = {
			values: {},
			phrases: []
		};

		const self = this;
		return {
			value(id, type) {
				result.values[id] = type;
				return this;
			},

			add(...args) {
				result.phrases.push(args);
				return this;
			},

			done() {
				self.data[id] = result;
				return self;
			}
		};
	}

	build() {
		return new LanguageSpecificValue(language => {
			const parent = new GraphBuilder(language)
				.name(this.name || 'options')
				.allowPartial();

			for(const id of Object.keys(this.data)) {
				const option = this.data[id];
				const instance = new ResolverBuilder(language, id);

				// Set the name of the parser - for easier debugging
				instance.parser._name = (this.name || 'options') + ':opt:' + id;

				// Transfer all of the values
				for(const valueKey of Object.keys(option.values)) {
					instance.value(valueKey, option.values[valueKey]);
				}

				// Transfer the phrases
				for(const phrase of option.phrases) {
					instance.add(...phrase);
				}

				const parser = instance.build();
				parent.add(parser, v => [ v[0] ]);
			}

			parent.add([ GraphBuilder.result(), GraphBuilder.result() ], v => v[0].concat(v[1]));
			parent.add([ GraphBuilder.result(), 'and', GraphBuilder.result() ], v => v[0].concat(v[1]));

			parent.mapResults(v => {
				return v.filter(v => !! v).map(o => ({
					option: o.intent,
					values: o.values,
					expression: o.expression
				}));
			});

			return new ParsingValue(parent.toMatcher(), Object.assign({
				supportsPartial: true
			}, this.options));
		});
	}
}

module.exports = function(options={}) {
	return new Builder(options);
};
