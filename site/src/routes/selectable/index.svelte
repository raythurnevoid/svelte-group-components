<svelte:options immutable={true} />

<script lang="ts">
	import type { ItemProps } from "./_components/types";
	import Editor from "./_components/Editor.svelte";

	let items: ItemProps[];

	let logs: string[] = [];

	function log(name: string) {
		logs = [...logs, name];
	}
</script>

<div class="page">
	<div>
		<Editor
			bind:items
			on:change={() => log("on:change")}
			on:optionsChange={() => log("on:optionsChange")}
		/>
	</div>
	<div>
		<div>
			Model:
			<pre>
				{JSON.stringify(items, null, 2)}
			</pre>
		</div>
		<hr />
		<div>
			Logs:
			<pre>
				{JSON.stringify(logs, null, 2)}
			</pre>
		</div>
	</div>
</div>

<style lang="scss">
	.page {
		display: flex;
		gap: 1em;

		> div {
			flex: 1;

			&:not(:last-child) {
				border-right: black solid 1px;
				padding-right: 1em;
			}
		}
	}
</style>
