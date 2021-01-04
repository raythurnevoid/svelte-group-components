import type { GroupItemContext, GroupBindings } from "../components-group";

export interface SelectionGroupItemContext extends GroupItemContext {
	selected: boolean;
	value: string;
	setSelected(value: boolean): void;
}

export interface OnSingleSelectionGroupChangeEvent {
	value: string;
}

export interface OnSelectionGroupOptionsChangeEvent {
	items: SelectionGroupItemContext[];
}

export interface OnMultiSelectionGroupChangeEvent {
	value: string;
}

export interface OnSelectableChangeEvent {
	selected: boolean;
}

export interface SelectionGroupBinding<
	T extends SelectionGroupItemContext = SelectionGroupItemContext
> extends GroupBindings<T> {
	updateItem(item: T): void;
}

export type SelectionType = "single" | "multi";
