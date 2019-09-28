import fastClone from 'fast-clone';

export function cloneObject(a: object): object {
	return Object.assign({}, a);
}

export function clone(r: any): any {
	if(r.clone) {
		return r.clone();
	}

	return fastClone(r);
}
