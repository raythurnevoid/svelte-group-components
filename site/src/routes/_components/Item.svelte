<svelte:options immutable={true} />

<script lang="ts">
	import { GroupItem } from "../../../../src/components-group";
	import type { GroupBindings } from "../../../../src/components-group";

	export let group: GroupBindings;

	let value: number = 0;
	let dom: HTMLSpanElement;
</script>

<GroupItem {group} {dom} context={value}>
	<span bind:this={dom}>{value}</span>
</GroupItem>

<button on:click={() => value++}>+</button>
