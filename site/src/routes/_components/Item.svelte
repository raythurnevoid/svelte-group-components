<script lang="ts">
	import { GroupItem } from "../../../../src/components-group";
	import type { GroupBindings } from "../../../../src/components-group";

	export let value: string;
	export let group: GroupBindings;

	let dom: HTMLSpanElement;
</script>

<GroupItem {group} {dom} context={value}>
	<span bind:this={dom}>test</span>
</GroupItem>
