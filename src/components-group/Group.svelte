<script lang="ts">
	import { createComponentsGroupStore } from "../components-group";
	import type { GroupBindings, GroupItem } from ".";
	import type { GroupStore } from "./ComponentsGroupStore";

	let group$ = createComponentsGroupStore();

	const group = {
		registerItem: (item: GroupItem) => {
			group$.registerItem(item);
		},
		unregisterItem: (item: GroupItem) => {
			group$.unregisterItem(item);
		},
	} as GroupBindings;

	export function getBindings(): GroupBindings {
		return group;
	}

	export function getItems(): GroupItem[] {
		return $group$;
	}

	export function getStore(): GroupStore {
		return group$;
	}
</script>

<svelte:options immutable={true} />

<slot {group} />
