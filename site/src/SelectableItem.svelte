<script lang="ts">
	import { Selectable } from "../../src/selectable";
	import type { SelectionGroupBinding } from "../../src/selectable";

	export let group: SelectionGroupBinding;
	export let value: string;
	let checked: boolean;

	let dom: HTMLSpanElement;

	function handleChecked() {
		checked = true;
	}
</script>

<Selectable {group} {dom} context={'test'} bind:selected={checked} {value}>
	<input bind:this={dom} type="radio" {checked} on:change={handleChecked} />
	radio
</Selectable>
