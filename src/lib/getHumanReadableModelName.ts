import type {
	CustomTypeModel,
	CustomTypeModelField,
	CustomTypeModelSlice,
	SharedSliceModel,
} from "@prismicio/types";

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
		return config.model.label;
	} else if (isSharedSliceModel(config.model)) {
		return config.model.name;
	} else if (
		isCustomTypeModelField(config.model) &&
		"label" in config.model.config
	) {
		return config.model.config.label;
	} else if (isCustomTypeModelSlice(config.model)) {
		return config.model.fieldset;
	} else {
		// Slice Zone
		return `Slice Zone (\`${config.id}\`)`;
	}
};
