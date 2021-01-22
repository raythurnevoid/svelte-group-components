import { createContext } from "@raythurnevoid/svelte-context-enhanced";

export const [
	setListBoxContext,
	getListBoxContext,
] = createContext<ListBoxContext>();

export interface ListBoxContext {
	onItemFocus: ({ dom: HTMLLIElement, value: string }) => void;
}
