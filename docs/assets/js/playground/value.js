import React from 'react';
import ValueLoader from '../value-loader';

const en = require('ecolect/language/en');

export default class ValuePlayground extends React.Component {

	constructor(value, defaultValue) {
		super();

		console.log(en)

		this.value = value;
		this.valueMatcher = value.matcher(en.default || en);
		this.valueLoader = new ValueLoader({
			loader: this.loadValue.bind(this),
			idleTime: 100,
			maxTime: 1000
		});

		this.valueLoader.on('data', this.onData.bind(this));

		this.state = {
			value: defaultValue || '',
			data: null
		};
		this.updateValue = this.updateValue.bind(this);

		this.valueLoader.value = this.state.value;
	}

	render() {
		return <div className="playground">
			<div className="playground__editor">
				<input type="text" value={ this.state.value } onChange={ this.updateValue } />
			</div>

			<div className="playground__data">{ this.renderValue(this.state.data) }</div>

			<div className="playground__js">
				JavaScript value:
				<pre>{ JSON.stringify(this.state.data, null, 2) }</pre>
			</div>
		</div>
	}

	updateValue(e) {
		const value = e.target.value;
		this.setState({ value: value });
		this.valueLoader.value = value;
	}

	loadValue(v) {
		return this.valueMatcher(v);
	}

	onData(v) {
		this.setState({ data: v });
	}

	renderValue() {
		return <div></div>;
	}

	renderExamples() {
		const examples = this.getExamples(this.language.id) || [];

		return <ul>
			{ examples.map(e => <li>{ e }</li>) }
		</ul>;
	}
}
