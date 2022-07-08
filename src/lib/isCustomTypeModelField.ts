import type { CustomTypeModelField } from "@prismicio/types";

export const isCustomTypeModelField = (
	model: unknown,
): model is CustomTypeModelField => {
	return typeof model === "object" && model !== null && "type" in model;
};
