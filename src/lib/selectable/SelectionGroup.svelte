<script lang="ts">
	import { SingleSelectionGroup } from "./index.js";
	import MultiSelectionGroup from "./MultiSelectionGroup.svelte";
	import type {
		SelectionGroupBinding,
		SelectionGroupItemContext,
		SelectionType,
	} from "./types";

	export let selectionType: SelectionType = undefined;
	export let value: any = undefined;
	export let nullable: boolean = undefined;
	export let group: SelectionGroupBinding = undefined;

	let selectionGroup: SingleSelectionGroup | MultiSelectionGroup;
	$: component = getComponent({
		group,
		selectionType,
	});

	$: value = selectionType ? value : undefined;

	function getComponent(deps: any) {
		if (!group) {
			if (selectionType === "single") return SingleSelectionGroup;
			else if (selectionType === "multi") return MultiSelectionGroup;
		}
	}

	export function getItems() {
		return selectionGroup?.getItems();
	}

	export function getBindings() {
		return selectionGroup?.getBindings();
	}

	export function setSelected(
		item: SelectionGroupItemContext,
		selected: boolean
	) {
		selectionGroup.setSelected(item, selected);
	}
</script>

{#if component}
	<svelte:component
		this={component}
		bind:this={selectionGroup}
		bind:value
		{nullable}
		on:change
		on:optionsChange
		let:group
	>
		<slot {group} />
	</svelte:component>
{:else}
	<slot {group} />
{/if}
