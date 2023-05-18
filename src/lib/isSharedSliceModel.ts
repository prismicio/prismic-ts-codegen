import { CustomTypeModelSliceType, SharedSliceModel } from "@prismicio/client";

import { hasOwnProperty } from "./hasOwnProperty";

export const isSharedSliceModel = (
	model: unknown,
): model is SharedSliceModel => {
	return (
		typeof model === "object" &&
		model !== null &&
		hasOwnProperty(model, "type") &&
		model.type === CustomTypeModelSliceType.SharedSlice
	);
};
