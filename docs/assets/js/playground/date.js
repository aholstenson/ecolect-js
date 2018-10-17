import React from 'react';
import ValuePlayground from './value';
import enhance from './enhance';

import Month from '../calendar/month';
import { date } from 'ecolect/values';

class DatePlayground extends ValuePlayground {
	constructor() {
		super(date(), 'today');
	}

	renderValue(v) {
		const date = v ? v.toDate() : new Date();
		return <div className="playground__date">
			<Month date={ date } selected={ v ? date : null } />
		</div>
	}
}

enhance('date', DatePlayground);
