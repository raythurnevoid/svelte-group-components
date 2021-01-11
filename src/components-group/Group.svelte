<script lang="ts">
	import { createComponentsGroupStore } from "../components-group";
	import type { GroupBindings, GroupItemContext } from ".";
	import type { GroupStore } from "./ComponentsGroupStore";
	import { setGroupContext } from "./GroupContext";

	let group$ = createComponentsGroupStore();

	const group = {
		registerItem: (item: GroupItemContext) => {
			group$.registerItem(item);
		},
		unregisterItem: (item: GroupItemContext) => {
			group$.unregisterItem(item);
		},
	} as GroupBindings;

	setGroupContext(group);

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

<svelte:options immutable={true} />

<slot {group} />
