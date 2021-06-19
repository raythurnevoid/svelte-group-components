import type {
	GroupItemContext,
	GroupBindings,
	OnGroupItemsUpdateEvent,
} from "../components-group";

export interface SelectionGroupItemContext extends GroupItemContext {
	selected: boolean;
	value: string;
	setSelected(value: boolean): void;
}

export interface OnSingleSelectionGroupChangeEvent {
	value: string;
}

export interface OnSelectionGroupOptionsChangeEvent
	extends OnGroupItemsUpdateEvent {
	items: SelectionGroupItemContext[];
}

export interface OnMultiSelectionGroupChangeEvent {
	value: string[];
}

export interface OnSelectableChangeEvent {
	selected: boolean;
}

export interface SelectionGroupBinding<
	T extends SelectionGroupItemContext = SelectionGroupItemContext
> extends GroupBindings<T> {}

export type SelectionType = "single" | "multi";
