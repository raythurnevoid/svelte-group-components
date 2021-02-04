<svelte:options immutable={true} />

<script lang="ts" context="module">
	let count: number = 0;
</script>

<script lang="ts">
	import { UseState } from "@raythurnevoid/svelte-hooks";
	import { GroupItem } from "../components-group";
	import type { GroupItemInit } from "../components-group";
	import { createEventDispatcher, onMount, tick } from "svelte";
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
	export const id: string = `@rt0/sgc/selectable/Selectable:${count++}`;

	let mounted: boolean = false;
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

	function getItems() {
		return group?.getItems();
	}

	function _setSelected(newValue: boolean) {
		selected = newValue;
		context.selected = selected;
	}

	async function updateContext(...deps) {
		Object.assign(context, {
			dom,
			externalContext,
			selected,
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
			getItems,
		});
	}

	export function setSelected(newValue: boolean) {
		_setSelected(newValue);
		group?.updateItem(context, {
			selected,
		});
	}
</script>

<UseState value={[dom, value, selected]} onUpdate={updateItem} />

<GroupItem {dom} {useGroupContext} onInit={handleGroupItemInit}>
	<slot />
</GroupItem>
