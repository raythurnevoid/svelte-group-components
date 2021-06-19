import { createContext } from "@raythurnevoid/svelte-context-enhanced";
import type { GroupBindings } from "./types.js";

export const [setGroupContext, getGroupContext] =
	createContext<GroupBindings>();
