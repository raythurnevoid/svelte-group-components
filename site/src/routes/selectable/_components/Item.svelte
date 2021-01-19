<svelte:options immutable={true} />

<script lang="ts" context="module">
	let count: number = 0;
</script>

<script lang="ts">
	import { Selectable } from "../../../../../src/selectable";
	import type { SelectionGroupBinding } from "../../../../../src/selectable";

	export let value: string;
	export let checked: boolean;
	export let group: SelectionGroupBinding;

	let id: string = `item:${count++}`;
	let dom: HTMLInputElement;
	let selectable: Selectable;

	function handleChange() {
		selectable.setSelected(dom.checked);
	}
</script>

<Selectable
	bind:this={selectable}
	bind:selected={checked}
	{value}
	{dom}
	{group}
>
	<label for={id}>
		<input
			bind:this={dom}
			{id}
			type="checkbox"
			{value}
			{checked}
			on:change={handleChange}
		/>
		{value}
	</label>
</Selectable>
