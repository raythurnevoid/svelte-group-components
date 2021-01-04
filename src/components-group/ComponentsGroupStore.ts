import { Writable, writable } from "svelte/store";
import { beforeOrAfter } from "./domBeforeOrAfter";
import type { GroupItem } from "./types";

export function createComponentsGroupStore<
	T extends GroupItem
>(): GroupStore<T> {
	const { subscribe, set, update } = writable<T[]>([]);

	return {
		subscribe,
		update,
		set,
		registerItem: (item: T) =>
			update((items) => {
				items.push(item);
				if (typeof window !== "undefined") {
					items.sort((a, b) => beforeOrAfter(a.dom, b.dom));
				}
				return [...items];
			}),
		unregisterItem: (item: T) =>
			update((items) => {
				const index = items.indexOf(item);
				if (~index) {
					items = items.slice(0, index).concat(items.slice(index + 1));
				}
				return [...items];
			}),
	};
}

export interface GroupStore<T extends GroupItem = any> extends Writable<T[]> {
	registerItem(item: T);
	unregisterItem(item: T);
}
