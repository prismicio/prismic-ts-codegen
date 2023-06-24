import { CustomTypeModel, CustomTypeModelField } from "@prismicio/client";

export function collectCustomTypeFields(
	model: CustomTypeModel,
): Record<string, CustomTypeModelField> {
	return Object.assign({}, ...Object.values(model.json));
}
