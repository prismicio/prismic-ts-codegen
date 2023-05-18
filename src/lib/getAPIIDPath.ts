import { PathElement } from "../types";
import type {
	CustomTypeModel,
	CustomTypeModelField,
	CustomTypeModelSlice,
	SharedSliceModel,
} from "@prismicio/types";
import { CustomTypeModelFieldType } from "@prismicio/types";

import { isCustomTypeModelField } from "./isCustomTypeModelField";
import { isCustomTypeModelSlice } from "./isCustomTypeModelSlice";
import { isSharedSliceModel } from "./isSharedSliceModel";

type GetAPIIDPathConfig = {
	path: [
		PathElement<CustomTypeModel | SharedSliceModel>,
		...PathElement<CustomTypeModelField | CustomTypeModelSlice>[],
	];
};

export const getAPIIDPath = (config: GetAPIIDPathConfig): string => {
	return config.path
		.map((element, i) => {
			if (
				isCustomTypeModelField(element.model) &&
				(element.model.type === CustomTypeModelFieldType.Group ||
					element.model.type === CustomTypeModelFieldType.Slices)
			) {
				return `${element.id}[]`;
			} else {
				if (element.id === "items") {
					const previousElement = config.path[i - 1];

					if (
						isCustomTypeModelSlice(previousElement.model) ||
						isSharedSliceModel(previousElement.model)
					) {
						return `${element.id}[]`;
					}
				}

				return element.id;
			}
		})
		.join(".");
};
