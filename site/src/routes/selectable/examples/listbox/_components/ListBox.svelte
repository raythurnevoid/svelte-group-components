<script lang="ts">
	import { setListBoxContext } from "./ListBoxContext";
	import type { ListBoxContext } from "./ListBoxContext";

	export let focusedItemValue: string;

	let dom: HTMLUListElement;

	setListBoxContext({
		onItemFocus: handleItemFocus,
	});

	function handleKeyPress(e: KeyboardEvent) {
		if (e.key === "ArrowDown" || e.key === "ArrowUp") {
			e.preventDefault();
			const element = e.target as HTMLElement;
			const closesItem = element.closest("li");

			if (e.key === "ArrowDown") {
				const nextElement = closesItem.nextElementSibling as HTMLElement;
				if (nextElement) {
					nextElement.focus();
				} else {
					(dom.firstElementChild as HTMLElement).focus();
				}
			} else if (e.key === "ArrowUp") {
				const prevElement = closesItem.previousElementSibling as HTMLElement;
				if (prevElement) {
					prevElement.focus();
				} else {
					(dom.lastElementChild as HTMLElement).focus();
				}
			}
		}
	}

	function handleSelection(e: Event) {
		const element = e.target as HTMLElement;
		const closesItem = element.closest("li");
		closesItem.focus();
	}

	function handleItemFocus({
		dom,
		value,
	}: Parameters<ListBoxContext["onItemFocus"]>[0]) {
		focusedItemValue = value;
	}
</script>

<ul
	bind:this={dom}
	role="listbox"
	on:keydown={handleKeyPress}
	on:click={handleSelection}
	tabindex="0"
>
	<slot />
</ul>

<style>
	ul {
		list-style: none;
	}
</style>
