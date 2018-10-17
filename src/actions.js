import { Builder as IntentsBuilder } from './intents';

export class Builder {
	constructor(lang) {
		this.builder = new IntentsBuilder(lang);
		this.handlers = new Map();
		this.id = 0;
	}

	action(id) {
		// Auto assign an id
		if(! id) id = ('__auto__' + ++this.id);

		const builder = this.builder.intent(id);

		const self = this;
		builder.handler = function(handler) {
			self.handlers.set(id, handler);
			return this;
		};

		const previousDone = builder.done;
		builder.done = function() {
			previousDone.apply(this);
			return self;
		};

		return builder;
	}

	build() {
		return new Actions(this.builder.build(), this.handlers);
	}
}

class Actions {
	constructor(matcher, handlers) {
		this.matcher = matcher;
		this.handlers = handlers;
	}

	get language() {
		return this.matcher.language;
	}

	match(expression, options) {
		const map = item => {
			if(! item) return item;

			item.activate = (...args) => {
				const handler = this.handlers.get(item.intent);
				const result = handler(item, ...args);
				return Promise.resolve(result);
			};

			return item;
		};

		return this.matcher.match(expression, options)
			.then(result => {
				result.matches = result.matches.map(map);
				result.best = map(result.best);

				return result;
			});
	}

	handle(expression, options) {
		return this.match(expression, options)
			.then(result => {
				if(! result.best) {
					return Promise.resolve({
						intent: null
					});
				} else {
					const r = options && options.arguments ? result.best.activate(...options.arguments) : result.best.activate();
					return Promise.resolve(r)
						.then(d => ({
							intent: result.best.intent,
							result: d
						}));
				}
			});
	}
}
