import type { GroupItem, GroupBindings } from "../components-group";

export interface SelectionGroupItem extends GroupItem {
	selected: boolean;
	value: string;
	setSelected(value: boolean): void;
}

export interface OnSingleSelectionGroupChangeEvent {
	value: string;
}

export interface OnSelectionGroupOptionsChangeEvent {
	items: SelectionGroupItem[];
}

export interface OnMultiSelectionGroupChangeEvent {
	value: string;
}

export interface OnSelectableChangeEvent {
	selected: boolean;
}

export interface SelectionGroupBinding<
	T extends SelectionGroupItem = SelectionGroupItem
> extends GroupBindings<T> {
	updateItem(item: T): void;
}

export type SelectionType = "single" | "multi";
