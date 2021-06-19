<svelte:options immutable={true} />

<script lang="ts">
	import { UseState } from "@raythurnevoid/svelte-hooks";
	import { createEventDispatcher, onDestroy, onMount, tick } from "svelte";
	import { Group, setGroupContext } from "../components-group/index.js";
	import type { GroupInit, GroupBindings } from "../components-group/index.js";
	import type {
		SelectionGroupBinding,
		SelectionGroupItemContext,
		OnMultiSelectionGroupChangeEvent,
		OnSelectionGroupOptionsChangeEvent,
	} from "./types";
	import { arrayEquals, tickCargo } from "../utils";

	export let value: string[] = undefined;
	export let nullable: boolean = true;

	let innerGroup: GroupBindings;
	let groupBindings: SelectionGroupBinding = {
		getItems() {
			return innerGroup.getItems() as SelectionGroupItemContext[];
		},
		updateItem,
		registerItem,
		unregisterItem,
	};

	setGroupContext(groupBindings);

	let valueState: UseState;
	let mounted: boolean = false;

	const dispatch =
		createEventDispatcher<{
			change: OnMultiSelectionGroupChangeEvent;
			optionsChange: OnSelectionGroupOptionsChangeEvent;
		}>();

	onMount(async () => {
		await tick();

		setValue(checkAndFixValue(value));
		if (value === undefined) {
			setValue(getNewValueFromItems());
		} else {
			updateItemsValue();
		}

		mounted = true;
	});

	let destroyed = false;
	onDestroy(() => {
		destroyed = true;
	});

	function getNewValueFromItems() {
		const selectedItems = filterSelectedItems();
		let newValue = selectedItems.map((item) => item.value);

		return newValue;
	}

	function updateItemsValue() {
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

	function filterSelectedItems() {
		const items = getItems();
		return items.filter((item) => item.selected);
	}

	function isValidValue(value: string[]) {
		if (!Array.isArray(value) || (!nullable && value?.length === 0)) {
			return false;
		}

		const items = getItems();
		return items.some((item) => value?.includes(item.value));
	}

	function checkAndFixValue(value: string[]) {
		let newValue = value;

		if (!isValidValue(value)) {
			if (typeof value === "string" && isValidValue([value])) {
				// If value is a valid string, set it as the value.
				newValue = [value];
			} else if (nullable) {
				newValue = [];
			} else {
				const items = getItems();
				const selectedItems = filterSelectedItems();
				if (selectedItems.length) {
					newValue = selectedItems.map((item) => item.value);
				} else if (!selectedItems.length && items.length) {
					newValue = [items[0].value];
				} else {
					// Set the value to undefined meaning that it should be valorized with a value from the items when available.
					newValue = undefined;
				}
			}
		}

		return newValue;
	}

	function handleValueUpdate() {
		setValue(checkAndFixValue(value));
		updateItemsValue();
	}

	async function handleValueUpdateAndUpdateItems(newValue: string[]) {
		newValue = checkAndFixValue(newValue);

		if (!arrayEquals(newValue, value)) {
			setValue(newValue);
			updateItemsValue();

			await tick();

			dispatch("change", {
				value,
			});
		}
	}

	async function updateItem(
		item: SelectionGroupItemContext,
		newContext: SelectionGroupItemContext
	) {
		if (destroyed) return;

		innerGroup.updateItem(item, newContext);
		if (mounted) {
			updateItemTickCargo.push(item);
		}
	}
	const updateItemTickCargo = tickCargo(
		async (updatedItems: SelectionGroupItemContext[]) => {
			let newValue = getNewValueFromItems();
			handleValueUpdateAndUpdateItems(newValue);
		}
	);

	async function unregisterItem(item: SelectionGroupItemContext) {
		if (destroyed) return;

		innerGroup.unregisterItem(item);
		unregisterItemTickCargo.push(item);
	}
	const unregisterItemTickCargo = tickCargo(
		async (unregisteredItems: SelectionGroupItemContext[]) => {
			const items = getItems();
			dispatch("optionsChange", {
				items: items,
			});

			const newValue = getNewValueFromItems();
			handleValueUpdateAndUpdateItems(newValue);
		}
	);

	async function registerItem(item: SelectionGroupItemContext) {
		if (destroyed) return;

		innerGroup.registerItem(item);
		if (mounted) {
			registerItemTickCargo.push(item);
		}
	}
	const registerItemTickCargo = tickCargo(
		async (registeredItems: SelectionGroupItemContext[]) => {
			const items = getItems();
			dispatch("optionsChange", {
				items: items,
			});

			const newValue = getNewValueFromItems();
			handleValueUpdateAndUpdateItems(newValue);
		}
	);

	function setValue(newValue: string[]) {
		value = newValue;
		valueState?.setValue?.(value);
	}

	async function handleNullableChange() {
		let newValue = getNewValueFromItems();
		handleValueUpdateAndUpdateItems(newValue);
	}

	function handleGroupInit(props: GroupInit) {
		innerGroup = props.group;
	}

	export function getItems() {
		return groupBindings.getItems();
	}

	export function setSelected(
		item: SelectionGroupItemContext,
		selected: boolean
	) {
		if (item.selected !== selected) {
			item.setSelected(selected);
			const newValue = getNewValueFromItems();
			handleValueUpdateAndUpdateItems(newValue);
		}
	}

	export function getBindings(): SelectionGroupBinding {
		return groupBindings;
	}
</script>

<UseState bind:this={valueState} {value} onUpdate={handleValueUpdate} />
<UseState value={nullable} onUpdate={handleNullableChange} />

<Group onInit={handleGroupInit}>
	<slot group={groupBindings} />
</Group>
