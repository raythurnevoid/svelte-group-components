<script lang="ts">
	import { UseState } from "@raythurnevoid/svelte-hooks";
	import { createEventDispatcher, onDestroy, onMount, tick } from "svelte";
	import { Group } from "../components-group";
	import type { GroupStore } from "../components-group";
	import type {
		SelectionGroupItemContext,
		OnSelectionGroupOptionsChangeEvent,
		OnSingleSelectionGroupChangeEvent,
	} from "./types";
	import type { SelectionGroupBinding } from ".";

	export let value: string = undefined;
	export let nullable: boolean = true;

	let group: Group;
	let group$: GroupStore;

	let groupBindings: SelectionGroupBinding = {
		getItems() {
			return group.getItems() as SelectionGroupItemContext[];
		},
		updateItem,
		registerItem,
		unregisterItem,
	};

	let valueState: UseState;
	let mounted: boolean = false;

	const dispatch = createEventDispatcher<{
		change: OnSingleSelectionGroupChangeEvent;
		optionsChange: OnSelectionGroupOptionsChangeEvent;
	}>();

	onMount(async () => {
		group$ = group.getStore();

		checkAndFixValue();
		await tick();

		if (nullable) {
			if (value === null || value !== undefined) {
				updateItems();
			} else {
				updateValue();
			}
		} else {
			if (value != undefined && value.length > 0) {
				updateItems();
				const items = getItems();
				if (!items.some((item) => item.selected) && items.length) {
					value = items[0].value;
				}
			} else {
				updateValue();
			}
		}

		mounted = true;
	});

	let destroyed = false;
	onDestroy(() => {
		destroyed = true;
	});

	function updateItems() {
		if (destroyed) return;

		const items = getItems();
		items.forEach((item) => {
			if (value === item.value && !item.selected) {
				item.setSelected(true);
			} else if (value !== item.value && item.selected) {
				item.setSelected(false);
			}
		});
	}

	function checkAndFixValue() {
		const items = getItems();
		if (typeof value !== "string") {
			if (Array.isArray(value) && typeof value[0] === "string") {
				value = value[0];
			} else if (nullable || !items.length) {
				if (value != undefined) {
					value = undefined;
				}
			}
		}
	}

	function handleValueUpdate() {
		const items = getItems();
		checkAndFixValue();

		if (
			!nullable &&
			items.length &&
			(!value || !items.some((item) => item.value === value))
		) {
			value = items[0].value;
		}

		if (value) {
			const item = items.find((item) => item.value === value);
			if (item && !item.selected) {
				item.setSelected(true);
			}
		}

		updateItems();
		// updateItemsRef();
	}

	function updateItemsRef() {
		// $items$ = [...$items$];
	}

	function getItemIndex(item: SelectionGroupItemContext) {
		const items = getItems();
		return items.indexOf(item);
	}

	function updateValue() {
		const items = getItems();
		const newValue = items.find((item) => item.selected)?.value;

		if (nullable) {
			value = newValue;
		} else {
			value = newValue ? newValue : items.length ? items[0].value : undefined;
		}
	}

	async function updateItem(item: SelectionGroupItemContext) {
		const newValue = item.selected ? item.value : undefined;

		if (newValue !== value) {
			setValue(newValue);
			updateItems();
			// updateItemsRef();

			await tick();

			dispatch("change", {
				value,
			});
		}
	}

	async function unregisterItem(item: SelectionGroupItemContext) {
		if (!destroyed) {
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
			value = newValue;
		} else if (nullable && !newValue) {
			value = undefined;
		} else if (!nullable && !newValue) {
			const items = getItems();
			value = items.length ? items[0].value : undefined;
		}

		valueState?.setValue(value);
	}

	function handleNullableChange() {
		updateValue();
		updateItems();
	}

	export function getItems() {
		return groupBindings.getItems();
	}

	export function setSelected(
		item: SelectionGroupItemContext,
		selected: boolean
	) {
		if (item.selected !== selected) {
			if (!selected && value === item.value) {
				setValue(undefined);
			} else if (selected) {
				setValue(item.value);
			}
			updateItems();
			// updateItemsRef();
		}
	}

	export function getBindings(): SelectionGroupBinding {
		return groupBindings;
	}
</script>

<svelte:options immutable={true} />

<UseState bind:this={valueState} {value} onUpdate={handleValueUpdate} />
<UseState value={nullable} onUpdate={handleNullableChange} />

<Group bind:this={group}>
	<slot group={groupBindings} />
</Group>
