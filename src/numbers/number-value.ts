import { NumberData } from './number-data';

export class NumberValue {
	private value: number;

	constructor(obj: NumberData) {
		this.value = obj.value;
	}

	public format(): string {
		return String(this.value);
	}
}
