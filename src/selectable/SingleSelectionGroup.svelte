<svelte:options immutable={true} />

<script lang="ts">
	import { UseState } from "@raythurnevoid/svelte-hooks";
	import { createEventDispatcher, onDestroy, onMount, tick } from "svelte";
	import { Group, setGroupContext } from "../components-group";
	import type { GroupInit, GroupBindings } from "../components-group";
	import type {
		SelectionGroupItemContext,
		OnSelectionGroupOptionsChangeEvent,
		OnSingleSelectionGroupChangeEvent,
	} from "./types";
	import type { SelectionGroupBinding } from ".";
	import { tickCargo } from "../utils";

	export let value: string = undefined;
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

	const dispatch = createEventDispatcher<{
		change: OnSingleSelectionGroupChangeEvent;
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

	function updateItemsValue() {
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

	function getNewValueFromItems() {
		const newValue = findSelectedItem()?.value;
		return newValue;
	}

	function findSelectedItem() {
		const items = getItems();
		return items.find((item) => item.selected);
	}

	function isValidValue(value: string) {
		if (typeof value !== "string" || (!nullable && value == undefined)) {
			return false;
		}

		const items = getItems();
		return items.some((item) => item.value === value);
	}

	function checkAndFixValue(value: string) {
		let newValue = value;

		if (!isValidValue(value)) {
			if (Array.isArray(value) && isValidValue(value[0])) {
				// If value is an array, and the first element is a valid string, set it as the value.
				newValue = value[0];
			} else if (nullable) {
				newValue = null;
			} else {
				const items = getItems();
				const firstSelectedItem = findSelectedItem();
				if (firstSelectedItem) {
					newValue = firstSelectedItem.value;
				} else if (!firstSelectedItem && items.length) {
					newValue = items[0].value;
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

	async function handleValueUpdateAndUpdateItems(newValue: string) {
		newValue = checkAndFixValue(newValue);

		if (newValue !== value) {
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
			// Take last selected item
			const newValue = updatedItems.reverse().find((item) => item.selected)
				?.value;
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

	function setValue(newValue: string) {
		value = newValue;
		valueState?.setValue?.(value);
	}

	function handleNullableChange() {
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
			let newValue: string;
			if (selected) {
				newValue = item.value;
			} else {
				newValue = getNewValueFromItems();
			}
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
