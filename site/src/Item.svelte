<script lang="ts">
	import { Item } from "../../src/components-group";
	import type { GroupBindings } from "../../src/components-group";

	export let group: GroupBindings;

	let dom: HTMLSpanElement;
</script>

<Item {group} {dom} context={'test'}><span bind:this={dom}>test</span></Item>
