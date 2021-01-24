<svelte:options immutable={true} />

<script lang="ts">
	import { UseState } from "@raythurnevoid/svelte-hooks";
	import { createEventDispatcher, onDestroy, onMount, tick } from "svelte";
	import { Group, setGroupContext } from "../components-group";
	import type { GroupInit, GroupBindings } from "../components-group";
	import type {
		SelectionGroupBinding,
		SelectionGroupItemContext,
		OnMultiSelectionGroupChangeEvent,
		OnSelectionGroupOptionsChangeEvent,
	} from "./types";

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

	const dispatch = createEventDispatcher<{
		change: OnMultiSelectionGroupChangeEvent;
		optionsChange: OnSelectionGroupOptionsChangeEvent;
	}>();

	onMount(async () => {
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

	function updateValueFromItems() {
		const items = getItems();
		const selectedItems = filterSelectedItems();
		let newValue = selectedItems.map((item) => item.value);

		if (!nullable && !value.length && items.length) {
			//If not items are selected. but the value cannot be left empty, i read the first item value
			newValue = [items[0].value];
		}

		setValue(newValue);
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

	function checkAndFixValue() {
		const items = getItems();

		if (!isValidValue(value)) {
			if (typeof value === "string" && isValidValue([value])) {
				// If value is a valid string, set it as the value.
				value = [value];
			} else if (nullable) {
				value = [];
			} else {
				const selectedItems = filterSelectedItems();
				if (selectedItems.length) {
					value = selectedItems.map((item) => item.value);
				} else if (!selectedItems.length && items.length) {
					value = [items[0].value];
				} else {
					// Set the value to undefined meaning that it should be valorized with a value from the items when available.
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
	}

	async function updateItem(
		item: SelectionGroupItemContext,
		newContext: SelectionGroupItemContext
	) {
		innerGroup.updateItem(item, newContext);
		updateValueFromItems();
		updateItemsValue();

		dispatch("change", {
			value,
		});
		// updateItemsRef();
	}

	async function unregisterItem(item: SelectionGroupItemContext) {
		console.log("unregister", item);

		if (!destroyed) {
			innerGroup.unregisterItem(item);
			await tick();

			const items = getItems();
			dispatch("optionsChange", {
				items: items,
			});

			updateValueFromItems();
		}
	}

	async function registerItem(item: SelectionGroupItemContext) {
		console.log("register", item);

		if (!destroyed) {
			innerGroup.registerItem(item);
			if (mounted) {
				const items = getItems();
				dispatch("optionsChange", {
					items: items,
				});

				updateValueFromItems();
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
		updateValueFromItems();
		updateItemsValue();
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
			// updateItemsRef();
			updateValueFromItems();
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
