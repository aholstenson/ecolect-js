'use strict';

import Emitter from 'events';

const isEqual = (a, b) => a === b;

export default class ValueLoader {
	constructor(options) {
		this.events = new Emitter();

		this.loader = options.loader;
		this.idleTime = options.idleTime || 1000;
		this.maxTime = options.maxTime || 10000;

		this.loadNextOnError = options.loadNextOnError || false;

		this.promise = null;

		this.dirty = false;
		this.refresh = this.refresh.bind(this);
	}

	on(event, listener) {
		this.events.on(event, listener);
	}

	off(event, listener) {
		this.events.off(event, listener);
	}

	get value() {
		return this._value;
	}

	set value(v) {
		if(isEqual(this._value, v)) return;

		this._value = v;

		this.maybeRefresh();
	}

	maybeRefresh() {
		// The current value is already loaded
		if(isEqual(this._loaded, this._value)) return;

		// Queue a timeout that trigger a refresh after the idle period
		clearTimeout(this.idleTimeout);
		this.idleTimeout = setTimeout(this.refresh, this.idleTime);

		// If we do not have a maximum time - queue a refresh
		if(! this.maxTimeout) {
			this.maxTimeout = setTimeout(this.refresh, this.maxTime);
		}

		// Mark the loader as dirty and emit an event to indicate that we have pending data
		if(! this.dirty) {
			this.dirty = true;
			this.events.emit('pending');
		}
	}

	refresh() {
		if(this.promise) {
			// Data is already being loaded, clear the timeouts
			clearTimeout(this.idleTimeout);
			this.idleTimeout = null;

			clearTimeout(this.maxTimeout);
			this.maxTimeout = null;
			return;
		}

		this.events.emit('loading', true);
		const loaded = this._value;
		this.promise = this.loader(loaded)
			.then(result => {
				this.reset(loaded, false);

				this.data = result;
				this.events.emit('data', result);
				this.events.emit('loading', false);
				return result;
			})
			.catch(ex => {
				this.reset(loaded, true);

				this.events.emit('error', ex);
				this.events.emit('loading', false);
				throw ex;
			});
	}

	reset(loaded, error) {
		// Timeouts are always cleared when we reset
		clearTimeout(this.idleTimeout);
		this.idleTimeout = null;

		clearTimeout(this.maxTimeout);
		this.maxTimeout = null;

		// Clear the promise so we can track if we are loaded
		this.promise = null;

		// Set the currently loaded data
		this._loaded = loaded;

		// Mark the loader as not dirty
		this.dirty = false;

		// Check if this is an error and if we should skip loading
		if(error && ! this.loadNextOnError) return;

		if(! isEqual(this._value, loaded)) {
			// Queue a refresh right away if our value is not what we actually loaded
			this.idleTimeout = setTimeout(this.refresh, 0);
		}
	}
}
