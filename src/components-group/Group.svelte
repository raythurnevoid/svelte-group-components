<svelte:options immutable={true} />

<script lang="ts">
	import { createComponentsGroupStore } from "../components-group";
	import type { GroupBindings, GroupItemContext } from ".";
	import type { GroupStore } from "./ComponentsGroupStore";
	import { setGroupContext } from "./GroupContext";
	import type {
		OnGroupItemsUpdateEvent,
		OnGroupItemUpdateEvent,
		GroupInit,
	} from "./types";
	import { createEventDispatcher, tick } from "svelte";

	export let onInit: (props: GroupInit) => void = undefined;

	const dispatch = createEventDispatcher<{
		optionsChange: OnGroupItemsUpdateEvent;
		update: OnGroupItemUpdateEvent;
	}>();

	let group$ = createComponentsGroupStore<GroupItemContext>();

	const group = {
		registerItem,
		unregisterItem,
		updateItem,
		getItems,
	} as GroupBindings;

	setGroupContext(group);

	onInit({ group });

	async function updateItem(
		item: GroupItemContext,
		newContext: GroupItemContext
	) {
		group$.updateItem(item, newContext);

		await tick();

		dispatch("update", {
			item,
			items: $group$,
		});
	}

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
