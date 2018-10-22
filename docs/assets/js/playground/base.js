import React from 'react';
import ValueLoader from '../value-loader';

export default class Playground extends React.Component {

	constructor(defaultValue) {
		super();

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

			{ this.renderData(this.state.data) }
		</div>
	}

	updateValue(e) {
		const value = e.target.value;
		this.setState({ value: value });
		this.valueLoader.value = value;
	}

	loadValue(v) {
	}

	onData(v) {
		this.setState({ data: v });
	}

	renderData() {

	}

	componentDidMount() {
		this.listener = e => {
			console.log(e.target.name);
			if(e.target.tagName === 'CODE' && withinExamples(e.target)) {
				const value = e.target.textContent;
				this.setState({ value: value });
				this.valueLoader.value = value;
			}
		};
		document.addEventListener('click', this.listener);
	}

	componentWillUnmount() {
		document.removeEventListener('click', this.listener);
	}
}

function withinExamples(el) {
	while(el) {
		if(el.classList.contains('playground-examples')) return true;

		el = el.parentNode;
	}

	return false;
}
