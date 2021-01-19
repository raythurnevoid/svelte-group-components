<script lang="ts">
	import { GroupItem } from "../../../../src/components-group";
	import type { GroupBindings } from "../../../../src/components-group";

	export let group: GroupBindings;

	let dom: HTMLSpanElement;
</script>

<GroupItem {group} {dom} context={"test"}>
	<span bind:this={dom}>test</span>
</GroupItem>
