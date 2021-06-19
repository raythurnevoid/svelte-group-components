<svelte:options immutable={true} />

<script lang="ts">
	import { getGroupContext } from "./GroupContext";
	import { onDestroy, onMount, tick } from "svelte";
	import type { GroupItemInit, GroupBindings, GroupItemContext } from "./types";
	import { UseState } from "@raythurnevoid/svelte-hooks";

	export let dom: HTMLElement = undefined;
	export let externalContext: any = undefined;
	export { externalContext as context };
	export let group: GroupBindings = undefined;
	export let useGroupContext: boolean = false;
	export let onInit: (props: GroupItemInit) => void = undefined;

	if (useGroupContext && !group) {
		group = getGroupContext();
	}

	const context = {
		dom,
		externalContext,
		updateContext(newContext) {
			Object.assign(context, {
				...newContext,
			});
			updateContext();
		},
		setGroup(newGroup) {
			group = newGroup;
		},
	} as GroupItemContext;

	onInit?.({
		group,
		context,
	});

	onMount(async () => {
		await tick();
		updateContext();
		group?.registerItem(context);
	});

	onDestroy(async () => {
		group?.unregisterItem?.(context);
	});

	function updateItem() {
		updateContext();
		group?.updateItem(context, {
			...getContextData(),
		});
	}

	function updateContext() {
		Object.assign(context, {
			...getContextData(),
		});
	}

	function getContextData() {
		return {
			dom,
			externalContext,
		};
	}
</script>

<UseState value={[dom, externalContext]} onUpdate={updateItem} />

<slot />
