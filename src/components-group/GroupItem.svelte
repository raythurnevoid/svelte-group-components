<svelte:options immutable={true} />

<script lang="ts">
	import { getGroupContext } from "./GroupContext";
	import { onDestroy, onMount, tick } from "svelte";
	import type { GroupItemInit, GroupBindings, GroupItemContext } from "./types";

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
			group?.updateItem(context, {
				...getContextData(),
				...newContext,
			});
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
		group?.registerItem(context);
	});

	onDestroy(async () => {
		group?.unregisterItem?.(context);
	});

	$: updateContext(dom, externalContext);
	function updateContext(...deps) {
		group?.updateItem(context, {
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

<slot />
