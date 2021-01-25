import { cargo } from "async";
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
