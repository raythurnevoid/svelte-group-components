<script lang="ts" context="module">
	let count: number = 0;
</script>

<script lang="ts">
	import { UseState } from "@raythurnevoid/svelte-hooks";
	import { createEventDispatcher, onDestroy, onMount, tick } from "svelte";
	import type {
		SelectionGroupBinding,
		OnSelectableChangeEvent,
		SelectionGroupItemContext,
	} from ".";

	export let group: SelectionGroupBinding = undefined;
	export let value: string = undefined;
	export let dom: HTMLElement = undefined;
	export let selected: boolean = undefined;
	export let context: any = undefined;

	let mounted: boolean = false;
	let selectedState: UseState;

	const dispatch = createEventDispatcher<{
		change: OnSelectableChangeEvent;
	}>();

	const self: SelectionGroupItemContext = {
		setSelected(newValue: boolean) {
			if (selected !== newValue) {
				_setSelected(newValue);

				tick().then(() => {
					dispatch("change", { selected });
				});
			}
		},
		getContext() {
			return context;
		},
	} as SelectionGroupItemContext;

	onMount(async () => {
		await tick();

		updateSelf();
		group?.registerItem(self);

		mounted = true;
	});

	onDestroy(async () => {
		updateSelf();
		group?.unregisterItem?.(self);
	});

	export function setSelected(newValue: boolean) {
		_setSelected(newValue);
		group?.updateItem(self);
	}

	function _setSelected(newValue: boolean) {
		selected = newValue;
		self.selected = selected;
		selectedState?.setValue(selected);
	}

	async function updateSelf(...deps) {
		Object.assign(self, {
			selected,
			dom,
			value,
		});
	}

	async function updateItem() {
		updateSelf();
		if (mounted) {
			await tick();
			group?.updateItem(self);
		}
	}
</script>

<svelte:options immutable={true} />

<UseState bind:this={selectedState} value={selected} onUpdate={updateItem} />
<UseState value={[dom, value]} onUpdate={updateItem} />

<slot />
