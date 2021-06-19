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
	import { createEventDispatcher, onDestroy, tick } from "svelte";
	import { tickCargo } from "../utils";

	export let onInit: (props: GroupInit) => void = undefined;

	let destroyed: boolean = false;

	const dispatch =
		createEventDispatcher<{
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

	onInit?.({ group });

	onDestroy(() => {
		destroyed = true;
	});

	async function updateItem(
		item: GroupItemContext,
		newContext: GroupItemContext
	) {
		if (destroyed) return;

		group$.updateItem(item, newContext);
		updateItemTickCargo.push(item);
	}
	const updateItemTickCargo = tickCargo(
		async (updatedItems: GroupItemContext[]) => {
			dispatch("update", {
				items: updatedItems,
			});
		}
	);

	async function registerItem(item: GroupItemContext) {
		if (destroyed) return;

		group$.registerItem(item);
		unregisterItemTickCargo.push(item);
	}
	const registerItemTickCargo = tickCargo(
		async (registeredItems: GroupItemContext[]) => {
			dispatch("optionsChange", {
				items: registeredItems,
			});
		}
	);

	async function unregisterItem(item: GroupItemContext) {
		if (destroyed) return;

		group$.unregisterItem(item);
		registerItemTickCargo.push(item);
	}
	const unregisterItemTickCargo = tickCargo(
		async (unregisteredItems: GroupItemContext[]) => {
			dispatch("optionsChange", {
				items: unregisteredItems,
			});
		}
	);

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
