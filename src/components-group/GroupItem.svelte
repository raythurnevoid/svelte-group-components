<script lang="ts">
	import { onDestroy, onMount, tick } from "svelte";
	import type { GroupBindings, GroupItemContext } from ".";

	export let dom: HTMLElement = undefined;
	export let context: any = undefined;
	export let group: GroupBindings = undefined;

	const self: GroupItemContext = {
		dom,
		getContext() {
			return context;
		},
	};

	$: updateSelf(dom, context);

	onMount(async () => {
		await tick();

		group?.registerItem(self);
	});

	onDestroy(async () => {
		group?.unregisterItem?.(self);
	});

	async function updateSelf(...deps) {
		Object.assign(self, {
			dom,
			context,
		});
	}
</script>

<svelte:options immutable={true} />

<slot />
