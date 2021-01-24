<svelte:options immutable={true} />

<script lang="ts">
	import { onMount, tick } from "svelte";
	import { Group } from "../../../src/components-group";
	import type {
		GroupBindings,
		GroupItemContext,
	} from "../../../src/components-group";
	import Item from "./_components/Item.svelte";

	if (typeof window !== "undefined") console.log(window?.location.href);

	let group: Group;

	let groupBindings: GroupBindings;

	let items: string[] = [];
	let itemsContext: GroupItemContext[];

	add();

	onMount(async () => {
		await tick();

		handleOptionsChange();
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
	<Group
		bind:this={group}
		on:optionsChange={handleOptionsChange}
		on:update={handleOptionsChange}
		onInit={({ group }) => {
			groupBindings = group;
		}}
	>
		{#each items as item, index}
			<div>
				<Item group={groupBindings} />
			</div>
		{/each}
	</Group>

	<div>
		<button on:click={add}>add</button>
		<button on:click={remove}>remove</button>
	</div>

	<div>contexts: {itemsContext?.map((item) => item.externalContext)}</div>
</div>
