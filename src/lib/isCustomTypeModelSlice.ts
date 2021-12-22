import type { CustomTypeModelSlice } from "@prismicio/types";

export const isCustomTypeModelSlice = (
	model: unknown,
): model is CustomTypeModelSlice => {
	return (
		typeof model === "object" &&
		model !== null &&
		"non-repeat" in model &&
		"repeat" in model
	);
};
