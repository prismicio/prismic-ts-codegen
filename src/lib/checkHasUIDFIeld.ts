import type { CustomTypeModel } from "@prismicio/client";

export function checkHasUIDField(model: CustomTypeModel): boolean {
	return "uid" in Object.assign({}, ...Object.values(model.json));
}
