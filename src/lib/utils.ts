import { cargo } from "async-es";
import { tick } from "svelte";

export function tickCargo<T>(cb: (data: T[]) => Promise<void>) {
	const tickCargoInstance = cargo(async (data: T[]) => {
		await tick();
		await cb(data);
	});

	return {
		push: tickCargoInstance.push,
	};
}

export function arrayEquals(a: any[], b: any[]) {
	return a.length === b.length && a.every((val, index) => val === b[index]);
}
