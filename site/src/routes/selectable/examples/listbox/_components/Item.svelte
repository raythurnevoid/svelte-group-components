<script lang="ts">
	import { getListBoxContext } from "./ListBoxContext";

	export let value: string;

	let dom: HTMLLIElement;

	const listBoxContext = getListBoxContext();

	function handleFocus() {
		listBoxContext.onItemFocus({ dom, value });
	}
</script>

<li bind:this={dom} role="option" tabindex="0" on:focus={handleFocus} {value}>
	<slot />
</li>

<style>
	li:focus {
		background-color: lightgray;
	}
</style>
