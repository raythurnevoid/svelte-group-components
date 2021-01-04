<script lang="ts">
	import { onMount, tick } from "svelte";
	import { SelectionGroup } from "../../src/selectable";
	import type {
		SelectionGroupBinding,
		SelectionGroupItem,
	} from "../../src/selectable";
	import { Group } from "../../src/components-group";
	import type { GroupBindings, GroupItem } from "../../src/components-group";
	import Item from "./Item.svelte";
	import SelectableItem from "./SelectableItem.svelte";

	let group: Group;
	let selectionGroup: SelectionGroup;

	let groupBindings: GroupBindings;
	let selectionGroupBindings: SelectionGroupBinding;

	let items: GroupItem[];
	let selectableItems: SelectionGroupItem[];

	onMount(async () => {
		groupBindings = group.getBindings();
		selectionGroupBindings = selectionGroup.getBindings();

		await tick();

		items = group.getItems();
		selectableItems = selectionGroup.getItems();
	});
</script>

<div>
	<Group bind:this={group} let:group>
		<Item group={groupBindings} />
		<Item group={groupBindings} />
	</Group>

	<div>contexts: {items?.map((item) => item.getContext())}</div>
</div>
<br />
<div>
	<SelectionGroup selectionType="single" bind:this={selectionGroup} let:group>
		<SelectableItem group={selectionGroupBindings} value="1" />
		<SelectableItem group={selectionGroupBindings} value="2" />
	</SelectionGroup>

	<div>contexts: {selectableItems?.map((item) => item.getContext())}</div>
</div>
