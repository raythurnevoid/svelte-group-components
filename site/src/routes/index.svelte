<svelte:options immutable={true} />

<script lang="ts">
	import { onMount, tick } from "svelte";
	import { SelectionGroup } from "../../../src/selectable";
	import type {
		SelectionGroupBinding,
		SelectionGroupItemContext,
	} from "../../../src/selectable";
	import { Group } from "../../../src/components-group";
	import type {
		GroupBindings,
		GroupItemContext,
	} from "../../../src/components-group";
	import Item from "./_components/Item.svelte";
	import SelectableItem from "./selectable/_components/SelectableItem.svelte";

	let group: Group;
	let selectionGroup: SelectionGroup;

	let groupBindings: GroupBindings;

	let items: string[] = [];
	let itemsContext: GroupItemContext[];
	let selectableItems: SelectionGroupItemContext[];

	add();
	add();

	onMount(async () => {
		groupBindings = group.getBindings();

		await tick();

		handleOptionsChange();
		selectableItems = selectionGroup.getItems();
	});

	function handleOptionsChange() {
		itemsContext = group.getItems();
	}

	function add() {
		items = [...items, "item"];
	}

	function remove() {
		items = items.slice(0, -1);
	}
</script>

<div>
	<Group bind:this={group} on:optionsChange={handleOptionsChange}>
		{#each items as item, index}
			<div>
				<Item group={groupBindings} value="{item} {index}" />
			</div>
		{/each}
	</Group>

	<div>
		<button on:click={add}>add</button>
		<button on:click={remove}>remove</button>
	</div>

	<div>contexts: {itemsContext?.map((item) => item.getContext())}</div>
</div>
