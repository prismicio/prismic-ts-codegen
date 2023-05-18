import type { CustomTypeModel } from "@prismicio/client";

export const isCustomTypeModel = (model: unknown): model is CustomTypeModel => {
	return typeof model === "object" && model !== null && "json" in model;
};
