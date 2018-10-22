import React from 'react';
import BasePlayground from './base';

import en  from 'ecolect/language/en';

export default class ValuePlayground extends BasePlayground {

	constructor(value, defaultValue) {
		super(defaultValue);

		this.value = value;
		this.valueMatcher = value.matcher(en);
	}

	renderData() {
		return <div className="playground__data">
			<div className="playground__data__value">{ this.renderValue(this.state.data) }</div>

			<div className="playground__data__js">
				JavaScript value:
				<pre>{ JSON.stringify(this.state.data, null, 2) }</pre>
			</div>
		</div>
	}

	loadValue(v) {
		return this.valueMatcher(v);
	}

	renderValue() {
		return <div></div>;
	}
}
