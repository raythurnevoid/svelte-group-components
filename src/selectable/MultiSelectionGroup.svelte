<script lang="ts">
	import { UseState } from "@raythurnevoid/svelte-hooks";
	import { createEventDispatcher, onDestroy, onMount, tick } from "svelte";
	import { Group } from "../components-group";
	import type { GroupStore } from "../components-group";
	import type {
		SelectionGroupBinding,
		SelectionGroupItem,
		OnMultiSelectionGroupChangeEvent,
		OnSelectionGroupOptionsChangeEvent,
	} from ".";

	export let value: string[] = undefined;
	export let nullable: boolean = true;

	let group: Group;
	let group$: GroupStore;

	let groupBindings: SelectionGroupBinding = {
		getItems() {
			return group.getItems() as SelectionGroupItem[];
		},
		updateItem,
		registerItem,
		unregisterItem,
	};

	let valueState: UseState;
	let mounted: boolean = false;

	const dispatch = createEventDispatcher<{
		change: OnMultiSelectionGroupChangeEvent;
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
				if (!isSomeItemSelected() && items.length) {
					value = [items[0].value];
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
			if (
				(nullable && value === null) ||
				(!item.selected && value.includes(item.value))
			) {
				item.setSelected(true);
			} else if (item.selected && !value.includes(item.value)) {
				item.setSelected(false);
			}
		});
	}

	function checkAndFixValue() {
		const items = getItems();
		if (!Array.isArray(value)) {
			if (typeof value === "string") {
				value = [value];
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

		if (!nullable) {
			if (
				items.length &&
				(!items.some((item) => value.includes(item.value)) ||
					value == undefined ||
					!value.length)
			) {
				setValue([items[0].value]);
			}
		}

		value?.forEach((itemValue) => {
			const item = items.find((item) => item.value === itemValue);
			if (item && !item.selected) {
				item.setSelected(true);
			}
		});

		items
			.filter((item) => !value || !value.includes(item.value))
			.forEach((item) => {
				if (item.selected) {
					item.setSelected(false);
				}
			});

		//updateItemsRef();
	}

	function updateItemsRef() {
		//$items$ = [...$items$];
	}

	function getItemIndex(item: SelectionGroupItem) {
		const items = getItems();
		return items.indexOf(item);
	}

	function updateValue() {
		const items = getItems();
		let newValue = items
			.filter((item) => item.selected)
			.map((item) => item.value);

		if (nullable) {
			setValue(newValue);
		} else {
			newValue = newValue.length
				? newValue
				: items.length
				? [items[0].value]
				: [];
			setValue(newValue);
		}
	}

	function updateItem(item: SelectionGroupItem) {
		updateValue();
		updateItems();
		// updateItemsRef();
	}

	async function unregisterItem(item: SelectionGroupItem) {
		if (!destroyed) {
			group$.unregisterItem(item);
			await tick();

			const items = getItems();
			dispatch("optionsChange", {
				items: items,
			});

			updateValue();
		}
	}

	function registerItem(item: SelectionGroupItem) {
		if (!destroyed) {
			group$.registerItem(item);
			if (mounted) {
				const items = getItems();
				dispatch("optionsChange", {
					items: items,
				});

				updateValue();
			}
		}
	}

	function isSomeItemSelected() {
		const items = getItems();
		return items.length && items.some((item) => item.selected);
	}

	function setValue(newValue: string[]) {
		value = newValue;
		valueState?.setValue?.(value);
	}

	function handleNullableChange() {
		updateValue();
		updateItems();
	}

	export function getItems() {
		return groupBindings.getItems();
	}

	export function setSelected(item: SelectionGroupItem, selected: boolean) {
		if (item.selected !== selected) {
			item.setSelected(selected);
			// updateItemsRef();
			updateValue();
		}
	}

	export function getBindings() {
		return group;
	}
</script>

<svelte:options immutable={true} />

<UseState bind:this={valueState} {value} onUpdate={handleValueUpdate} />
<UseState value={nullable} onUpdate={handleNullableChange} />

<Group bind:this={group}>
	<slot group={groupBindings} />
</Group>
