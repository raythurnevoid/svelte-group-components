export interface GroupBindings<T extends GroupItemContext = GroupItemContext> {
	registerItem(item: T): void;
	unregisterItem(item: T): void;
	getItems(): T[];
}

export interface GroupItemContext {
	dom: HTMLElement;
	getContext(): any;
}
