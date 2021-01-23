<svelte:options immutable={true} />

<script lang="ts">
	import { createComponentsGroupStore } from "../components-group";
	import type { GroupBindings, GroupItemContext } from ".";
	import type { GroupStore } from "./ComponentsGroupStore";
	import { setGroupContext } from "./GroupContext";
	import type { OnGroupOptionsChangeEvent } from "./types";
	import { createEventDispatcher, tick } from "svelte";

	const dispatch = createEventDispatcher<{
		optionsChange: OnGroupOptionsChangeEvent;
	}>();

	let group$ = createComponentsGroupStore();

	const group = {
		registerItem,
		unregisterItem,
		getItems,
	} as GroupBindings;

	setGroupContext(group);

	async function registerItem(item: GroupItemContext) {
		group$.registerItem(item);

		await tick();

		dispatch("optionsChange", {
			items: $group$,
		});
	}

	async function unregisterItem(item: GroupItemContext) {
		group$.unregisterItem(item);

		await tick();

		dispatch("optionsChange", {
			items: $group$,
		});
	}

	export function getBindings(): GroupBindings {
		return group;
	}

	export function getItems(): GroupItemContext[] {
		return $group$;
	}

	export function getStore(): GroupStore {
		return group$;
	}
</script>

<slot {group} />
