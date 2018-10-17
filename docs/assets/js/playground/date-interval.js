import React from 'react';
import ValuePlayground from './value';
import enhance from './enhance';

import Month from '../calendar/month';
import { dateInterval } from 'ecolect/values';
import addMonths from 'date-fns/addMonths';

class DateIntervalPlayground extends ValuePlayground {
	constructor() {
		super(dateInterval(), 'this month');
	}

	renderValue(v) {
		let from;
		let end;
		if(v) {
			from = v.start ? v.start.toDate() : null;
			end = v.end ? v.end.toDate() : null;
		} else {
			from = new Date();
			end = addMonths(from, 1);
		}

		return <div className="playground__date-interval">
			{ from && <Month date={ from } selected={ v && v.start && from } /> }
			{ end && <Month date={ end } selected={ v && v.end && end } /> }
		</div>
	}
}

enhance('date-interval', DateIntervalPlayground);
