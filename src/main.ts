/**
 * Executes a function on a set of data. Like Promise.all but in order. 
 * 
 * TODO: Consider splitting out thunkify?
 * @param arr Some array
 * @param func A function to execute on every element of that data set sequentially.
 */
export function execSequentially<T>(arr:T[], func:(x:T) => any) {
	return arr.reduce((acc, cur) => acc.then(() => func(cur)), Promise.resolve());
}


/**
 * Inspired by thread pools in Java/.NET. execSequentially is like promisePool(thunks, 1);
 * 
 * Could be used to throttle many downloads, for example. 
 * @param arr An array of promise thunks
 * @param limit How many promises should execute simultaneously. 
 */
export function promisePool<T>(arr:(() => Promise<T>)[], limit:number):Promise<T[]> {
	let boxedLimit = Math.min(limit, arr.length);
	let next = boxedLimit;
	let crashCount = 0;

	let result = Array(arr.length);
	return new Promise(resolve => {
		function passBaton(id:number) {
			if (id >= arr.length) {
				if (++crashCount === boxedLimit) resolve(result);
			} else {
				arr[id]()
					.then(x => result[id] = x)
					.then(() => passBaton(next++))
			}
		}

		[...Array(boxedLimit).keys()].forEach(passBaton);
	})
}