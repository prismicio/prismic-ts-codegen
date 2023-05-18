import type { CustomTypeModelField } from "@prismicio/client";

export const isCustomTypeModelField = (
	model: unknown,
): model is CustomTypeModelField => {
	return typeof model === "object" && model !== null && "type" in model;
};
