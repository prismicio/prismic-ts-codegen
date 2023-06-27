import { CustomTypeModel } from "@prismicio/client";

import { collectCustomTypeFields } from "./collectCustomTypeFields";

export function checkHasUIDField(model: CustomTypeModel): boolean {
	return "uid" in collectCustomTypeFields(model);
}
