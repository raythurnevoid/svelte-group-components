<svelte:options immutable={true} />

<script lang="ts">
	import { UseState } from "@raythurnevoid/svelte-hooks";
	import { GroupItem, GroupItemInit } from "../components-group";
	import { createEventDispatcher, onDestroy, onMount, tick } from "svelte";
	import type {
		SelectionGroupBinding,
		OnSelectableChangeEvent,
		SelectionGroupItemContext,
	} from ".";

	export let group: SelectionGroupBinding = undefined;
	export let value: string = undefined;
	export let dom: HTMLElement = undefined;
	export let selected: boolean = undefined;
	export let externalContext: any = undefined;
	export { externalContext as context };
	export let useGroupContext: boolean = false;

	let mounted: boolean = false;
	let selectedState: UseState;
	let context: SelectionGroupItemContext;

	const dispatch = createEventDispatcher<{
		change: OnSelectableChangeEvent;
	}>();

	onMount(async () => {
		await tick();
		mounted = true;
	});

	async function registerItem(item: SelectionGroupItemContext) {
		updateContext();
		group?.registerItem(item);
	}

	async function unregisterItem(item: SelectionGroupItemContext) {
		updateContext();
		group?.unregisterItem?.(item);
	}

	async function updateItem() {
		updateContext();
		if (mounted) {
			await tick();
			group?.updateItem(context);
		}
	}

	function _setSelected(newValue: boolean) {
		selected = newValue;
		context.selected = selected;
		selectedState?.setValue(selected);
	}

	async function updateContext(...deps) {
		Object.assign(context, {
			selected,
			dom,
			value,
		});
	}

	function handleGroupItemInit(groupItem: GroupItemInit) {
		groupItem.context.updateContext({
			dom,
			externalContext,
			selected,
			value,
			setSelected(newValue: boolean) {
				if (selected !== newValue) {
					_setSelected(newValue);

					tick().then(() => {
						dispatch("change", { selected });
					});
				}
			},
		} as SelectionGroupItemContext);
		context = groupItem.context as SelectionGroupItemContext;

		context.setGroup({
			...groupItem.group,
			registerItem,
			unregisterItem,
			updateItem,
			getItems: group.getItems,
		});
	}

	export function setSelected(newValue: boolean) {
		_setSelected(newValue);
		group?.updateItem(context, {
			selected,
		});
	}
</script>

<UseState bind:this={selectedState} value={selected} onUpdate={updateItem} />
<UseState value={[dom, value]} onUpdate={updateItem} />

<GroupItem bind:dom {group} {useGroupContext} onInit={handleGroupItemInit}>
	<slot />
</GroupItem>
