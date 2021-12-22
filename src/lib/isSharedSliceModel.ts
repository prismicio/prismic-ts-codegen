import type { SharedSliceModel } from "@prismicio/types";

export const isSharedSliceModel = (
	model: unknown,
): model is SharedSliceModel => {
	return typeof model === "object" && model !== null && "variations" in model;
};
