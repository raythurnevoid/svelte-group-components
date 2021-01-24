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
		if (typeof value !== "string" || (!nullable && value == undefined)) {
			return false;
		}

		const items = getItems();
		return items.some((item) => item.value === value);
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

		updateItemsValue();
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

	async function updateItem(
		item: SelectionGroupItemContext,
		newContext: SelectionGroupItemContext
	) {
		innerGroup.updateItem(item, newContext);

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
			innerGroup.unregisterItem(item);

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
			innerGroup.registerItem(item);
			if (mounted) {
				const items = getItems();
				dispatch("optionsChange", {
					items: items,
				});

				const oldValue = value;
				updateValueFromItems();
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
		updateValueFromItems();
		updateItemsValue();
	}

	function getValue$() {
		return value;
	}

	function setValue$(newValue: string) {
		return (value = newValue);
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
			if (!selected && value === item.value) {
				setValue(undefined);
			} else if (selected) {
				setValue(item.value);
			}
			updateItemsValue();
			// updateItemsRef();
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
