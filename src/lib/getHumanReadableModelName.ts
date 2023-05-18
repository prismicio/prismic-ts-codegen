import type {
	CustomTypeModel,
	CustomTypeModelField,
	CustomTypeModelSlice,
	SharedSliceModel,
} from "@prismicio/client";

import { isCustomTypeModel } from "./isCustomTypeModel";
import { isCustomTypeModelField } from "./isCustomTypeModelField";
import { isCustomTypeModelSlice } from "./isCustomTypeModelSlice";
import { isSharedSliceModel } from "./isSharedSliceModel";

type GetModelHumanNameConfig = {
	id: string;
	model:
		| CustomTypeModel
		| SharedSliceModel
		| CustomTypeModelField
		| CustomTypeModelSlice;
};

export const getHumanReadableModelName = (
	config: GetModelHumanNameConfig,
): string => {
	if (isCustomTypeModel(config.model)) {
		return config.model.label || config.model.id;
	} else if (isSharedSliceModel(config.model)) {
		return config.model.name;
	} else if (isCustomTypeModelField(config.model)) {
		if (config.model.config && "label" in config.model.config) {
			// Non-Slice Zone fields
			return config.model.config.label || config.id;
		} else if (config.model.config && "fieldset" in config.model) {
			// Slice Zone
			return config.model.fieldset || config.id;
		}
	} else if (isCustomTypeModelSlice(config.model)) {
		return config.model.fieldset || config.id;
	}

	return `\`${config.id}\``;
};
