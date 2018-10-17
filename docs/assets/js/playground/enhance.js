import React from 'react';
import ReactDOM from 'react-dom';

export default function(id, Component) {

	for(const e of document.querySelectorAll('.playground-' + id)) {
		ReactDOM.render(<Component></Component>, e);
	}
};
