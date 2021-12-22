import type {
	CustomTypeModel,
	CustomTypeModelField,
	CustomTypeModelSlice,
	SharedSliceModel,
} from "@prismicio/types";

import { PathElement } from "../types";
import { getHumanReadableModelName } from "./getHumanReadableModelName";

type GetHumanReadableFieldPathConfig = {
	path: [
		PathElement<CustomTypeModel | SharedSliceModel>,
		...PathElement<CustomTypeModelField | CustomTypeModelSlice>[]
	];
};

export const getHumanReadableFieldPath = (
	config: GetHumanReadableFieldPathConfig,
): string => {
	return config.path
		.map((element) => {
			if (element.label) {
				return element.label;
			} else if (element.model) {
				return getHumanReadableModelName({
					id: element.id,
					model: element.model,
				});
			} else {
				return element.id;
			}
		})
		.join(" → ");
};
