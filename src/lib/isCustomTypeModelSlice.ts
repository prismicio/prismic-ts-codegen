import {
	CustomTypeModelSlice,
	CustomTypeModelSliceType,
} from "@prismicio/types";

import { hasOwnProperty } from "./hasOwnProperty";

export const isCustomTypeModelSlice = (
	model: unknown,
): model is CustomTypeModelSlice => {
	return (
		typeof model === "object" &&
		model !== null &&
		hasOwnProperty(model, "type") &&
		model.type === CustomTypeModelSliceType.Slice
	);
};
