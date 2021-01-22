import { createEventDispatcher, onDestroy, onMount, tick } from "svelte";
import { get, writable } from "svelte/store";
import {
	createComponentsGroupStore,
	setGroupContext,
} from "../../components-group";
import type {
	SelectionGroupItemContext,
	OnSelectionGroupOptionsChangeEvent,
	OnSingleSelectionGroupChangeEvent,
} from "../types";
import type { SelectionGroupBinding } from "..";

export function createSingleSelectionGroup({ nullable }: Options) {
	const value$ = writable<string>(undefined);
	const group$ = createComponentsGroupStore();

	const groupBindings: SelectionGroupBinding = {
		getItems() {
			return get(group$) as SelectionGroupItemContext[];
		},
		updateItem,
		registerItem,
		unregisterItem,
	};

	setGroupContext(groupBindings);

	let mounted: boolean = false;

	//TODO: to move from here
	const dispatch = createEventDispatcher<{
		change: OnSingleSelectionGroupChangeEvent;
		optionsChange: OnSelectionGroupOptionsChangeEvent;
	}>();

	onMount(async () => {
		const value = getValue$();

		await tick();

		checkAndFixValue();
		if (value === undefined) {
			updateValueFromItems();
		} else {
			updateItemsValue();
		}

		mounted = true;
	});

	let destroyed = false;
	onDestroy(() => {
		destroyed = true;
	});

	function updateItemsValue() {
		if (destroyed) return;

		const value = getValue$();

		const items = getItems();
		items.forEach((item) => {
			if (value === item.value && !item.selected) {
				item.setSelected(true);
			} else if (value !== item.value && item.selected) {
				item.setSelected(false);
			}
		});
	}

	function findFirstSelectedItem() {
		const items = getItems();
		return items.find((item) => item.selected);
	}

	function isValidValue(value: string) {
		const items = getItems();
		return items.some((item) => item.value);
	}

	function checkAndFixValue() {
		const value = getValue$();

		if (!isValidValue(value)) {
			if (Array.isArray(value) && isValidValue(value[0])) {
				// If value is an array, and the first element is a valid string, set it as the value.
				setValue$(value[0]);
			} else if (nullable) {
				setValue$(null);
			} else {
				const items = getItems();
				const firstSelectedItem = findFirstSelectedItem();
				if (firstSelectedItem) {
					setValue$(firstSelectedItem.value);
				} else if (!firstSelectedItem && items.length) {
					setValue$(items[0].value);
				} else {
					// Set the value to undefined meaning that it should be valorized with a value from the items when available.
					setValue$(undefined);
				}
			}
		}
	}

	function updateValue() {
		const items = getItems();
		const newValue = items.find((item) => item.selected)?.value;

		if (nullable) {
			setValue$(newValue);
		} else {
			setValue$(
				newValue ? newValue : items.length ? items[0].value : undefined
			);
		}
	}

	function updateValueFromItems() {
		const items = getItems();
		const newValue = items.find((item) => item.selected)?.value ?? null;

		if (nullable) {
			setValue$(newValue);
		} else {
			setValue$(
				newValue ? newValue : items.length ? items[0].value : undefined
			);
		}
	}

	async function updateItem(item: SelectionGroupItemContext) {
		const value = getValue$();

		const newValue = item.selected ? item.value : undefined;

		if (newValue !== value) {
			setValue(newValue);
			updateItemsValue();
			// updateItemsRef();

			await tick();

			dispatch("change", {
				value,
			});
		}
	}

	async function unregisterItem(item: SelectionGroupItemContext) {
		if (!destroyed) {
			const value = getValue$();

			group$.unregisterItem(item);

			await tick();

			const items = getItems();
			dispatch("optionsChange", {
				items: items,
			});

			if (value === item.value) {
				setValue(undefined);

				await tick();

				dispatch("change", {
					value,
				});
			}
		}
	}

	async function registerItem(item: SelectionGroupItemContext) {
		if (!destroyed) {
			const value = getValue$();

			group$.registerItem(item);
			if (mounted) {
				const items = getItems();
				dispatch("optionsChange", {
					items: items,
				});

				const oldValue = value;
				updateValue();
				if (oldValue !== value) {
					dispatch("change", {
						value,
					});
				}
			}

			await tick();

			const items = getItems();
			dispatch("optionsChange", {
				items: items,
			});
		}
	}

	function setValue(newValue: string) {
		if (destroyed) return;

		if (newValue) {
			setValue$(newValue);
		} else if (nullable && !newValue) {
			setValue$(undefined);
		} else if (!nullable && !newValue) {
			const items = getItems();
			setValue$(items.length ? items[0].value : undefined);
		}
	}

	function getItems() {
		return groupBindings.getItems();
	}

	function getValue$() {
		return get(value$);
	}

	function setValue$(value: string) {
		return value$.set(value);
	}
}

interface Options {
	nullable: boolean;
}
