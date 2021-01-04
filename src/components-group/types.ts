export interface GroupBindings<T extends GroupItem = GroupItem> {
	registerItem(item: T): void;
	unregisterItem(item: T): void;
	getItems(): T[];
}

export interface GroupItem {
	dom: HTMLElement;
	getContext(): any;
}
