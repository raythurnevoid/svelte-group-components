import { getGroupContext } from "./GroupContext";
import { onDestroy, onMount, tick } from "svelte";
import { writable, get } from "svelte/store";
import type { GroupBindings, GroupItemContext } from ".";

export function createGroupItem(input: Input) {
	const output$ = writable({} as OutputProps);

	init();
	function init() {
		const { useGroupContext, group, dom } = input.props();

		if (useGroupContext && !group) {
			output$.update((output) => {
				output.group = getGroupContext();
				return output;
			});
		}

		output$.update((output) => {
			output.context = {
				dom,
				getContext: () => getExternalContext(),
			};

			return output;
		});
	}

	onMount(async () => {
		await tick();

		const { context, group } = get(output$);

		group?.registerItem(context);
	});

	onDestroy(async () => {
		const { context, group } = get(output$);

		group?.unregisterItem?.(context);
	});

	function getExternalContext() {
		const { externalContext } = input.props();
		return externalContext;
	}

	function updateContext(...deps) {
		const { context, group } = get(output$);
		const { dom, externalContext } = input.props();

		group?.updateItem(context, {
			dom,
		});
	}

	return {
		output$,
		updateContext,
	};
}

interface Input {
	props: () => Props;
}

interface OutputProps {
	context: GroupItemContext;
	group: GroupBindings;
}

interface Props {
	group: GroupBindings;
	useGroupContext: boolean;
	dom: HTMLElement;
	externalContext: any;
}
