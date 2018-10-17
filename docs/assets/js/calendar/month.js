'use strict';

import React from 'react';
import PropTypes from 'prop-types';

import classnames from 'classnames';

import endOfMonth from 'date-fns/endOfMonth';
import startOfMonth from 'date-fns/startOfMonth';
import dayOfWeek from 'date-fns/getDay';
import addDays from 'date-fns/addDays';
import isSameDay from 'date-fns/isSameDay';

export default class MonthView extends React.Component {

	static propTypes = {
		date: PropTypes.instanceOf(Date).isRequired,

		weekStartsOn: PropTypes.number.isRequired,

		selected: PropTypes.instanceOf(Date),
		onSelect: PropTypes.func
	};

	static defaultProps = {
		weekStartsOn: 0 /* Sunday */
	}

	constructor(props, context) {
		super(props, context);
	}

	render() {
		const weekStartsOn = this.props.weekStartsOn;
		const lastDay = endOfMonth(this.props.date);
		const firstDay = startOfMonth(this.props.date);

		const datesToRender = [];
		const now = new Date();

		const firstDayOfWeek = dayOfWeek(firstDay);
		for(let i=weekStartsOn; i<firstDayOfWeek; i++) {
			const date = addDays(firstDay, - (firstDayOfWeek - i));
			datesToRender.push({
				date: date,
				today: isSameDay(date, now),
				sameMonth: false
			});
		}

		for(let i=0; i<lastDay.getDate(); i++) {
			const date = addDays(firstDay, i);
			datesToRender.push({
				date: date,
				selected: isSameDay(date, this.props.selected),
				today: isSameDay(date, now),
				sameMonth: true
			});
		}

		const lastDayOfWeek = dayOfWeek(lastDay);
		for(let i=lastDayOfWeek+1; i<7 - weekStartsOn; i++) {
			const date = addDays(lastDay, i - lastDayOfWeek);
			datesToRender.push({
				date: date,
				today: isSameDay(date, now),
				sameMonth: false
			});
		}

		return <div className="calendar-month">
			<div className="calendar-month__header">
				{ this.props.date.getMonth() + 1 }/
				{ this.props.date.getFullYear() }
			</div>
			<table>
				<thead>
					<tr>
						<th>Sun</th>
						<th>Mon</th>
						<th>Tue</th>
						<th>Wed</th>
						<th>Thu</th>
						<th>Fri</th>
						<th>Sat</th>
					</tr>
				</thead>
				<tbody>
					{ this.renderWeekByWeek(datesToRender) }
				</tbody>

			</table>
		</div>;
	}

	renderWeekByWeek(datesToRender) {
		const result = [];
		for(let i=0; i<datesToRender.length; i+=7) {
			result.push(this.renderWeek(result.length, datesToRender.slice(i, i+7)));
		}

		return result;
	}

	renderWeek(idx, datesToRender) {
		return <tr className="calendar-month__week" key={ idx }>
			{ datesToRender.map(data => {
				return <td key={ data.date.getDate() } className={ classnames({
					'calendar-month__day': true,
					'calendar-month__day--today': data.today,
					'calendar-month__day--other-month': ! data.sameMonth,
					'calendar-month__day--selected': data.selected
				})}
				onClick={ () => this.props.onSelect && this.props.onSelect(data.date) }
				>{ data.date.getDate() }</td>
			}) }
		</tr>;
	}
}
