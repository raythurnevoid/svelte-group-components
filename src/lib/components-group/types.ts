import type { GroupStoreBindings } from "./ComponentsGroupStore";

export interface GroupBindings<T extends GroupItemContext = GroupItemContext>
	extends GroupStoreBindings<T> {
	getItems(): T[];
}

export interface GroupItemContext<T = any> {
	dom: HTMLElement;
	externalContext: T;
	updateContext<C extends GroupItemContext = GroupItemContext>(newContext: C);
	setGroup<G extends GroupBindings = GroupBindings>(newGroup: G);
}

export interface OnGroupItemsUpdateEvent {
	items: GroupItemContext[];
}

export interface OnGroupItemUpdateEvent {
	items: GroupItemContext[];
}

export interface GroupInit {
	group: GroupBindings;
}

export interface GroupItemInit extends GroupInit {
	context: GroupItemContext;
}
