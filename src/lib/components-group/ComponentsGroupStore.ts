import { Writable, writable } from "svelte/store";
import { beforeOrAfter } from "./domBeforeOrAfter.js";
import type { GroupItemContext } from "./index.js";

export function createComponentsGroupStore<
	T extends GroupItemContext
>(): GroupStore<T> {
	const { subscribe, set, update } = writable<T[]>([]);

	return {
		subscribe,
		update,
		set,
		async registerItem(item: T) {
			update((items) => {
				items.push(item);
				if (typeof window !== "undefined") {
					items.sort((a, b) => beforeOrAfter(a.dom, b.dom));
				}
				return [...items];
			});
		},
		async unregisterItem(item: T) {
			update((items) => {
				const index = items.indexOf(item);
				if (~index) {
					items = items.slice(0, index).concat(items.slice(index + 1));
				}
				return [...items];
			});
		},
		async updateItem(item: T, newContext?: Partial<GroupItemContext>) {
			if (newContext) {
				Object.assign(item, newContext);
			}

			update((items) => {
				return [...items];
			});
		},
	};
}

export interface GroupStore<T extends GroupItemContext = any>
	extends Writable<T[]>,
		GroupStoreBindings<T> {}

export interface GroupStoreBindings<T extends GroupItemContext = any> {
	registerItem(item: T): Promise<void>;
	unregisterItem(item: T): Promise<void>;
	updateItem(item: T, newContext?: Partial<T>): Promise<void>;
}
