import { createContext } from "@raythurnevoid/svelte-context-enhanced";
import type { GroupBindings } from "./types";

export const [
	setGroupContext,
	getGroupContext,
] = createContext<GroupBindings>();
