import fastClone from 'fast-clone';

export function cloneObject(a) {
	let result = {};
	for(const k in a) {
		if(a.hasOwnProperty(k)) result[k] = a[k];
	}
	return result;
}

export function clone(r) {
	if(r._clone) {
		return r._clone();
	}

	return fastClone(r);
}
