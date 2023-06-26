import { CustomTypeModel, CustomTypeModelField } from "@prismicio/client";
import { source as typescript } from "common-tags";

import { buildTypeName } from "../lib/buildTypeName";

function collectCustomTypeFields(
	model: CustomTypeModel,
): Record<string, CustomTypeModelField> {
	return Object.assign({}, ...Object.values(model.json));
}

type BuildCustomTypeDataTypeArgs = {
	model: CustomTypeModel;
};

type BuildCustomTypeDataTypeReturnValue = {
	name: string;
	code: string;
};

export function buildCustomTypeDataType(
	args: BuildCustomTypeDataTypeArgs,
): BuildCustomTypeDataTypeReturnValue {
	let code = "";

	const fields = collectCustomTypeFields(args.model);
	// UID fields are top-level document properties, not data properties.
	delete fields.uid;

	const hasDataFields = Object.keys(fields).length > 0;

	const name = buildTypeName(args.model.id, "Document", "Data");

	if (hasDataFields) {
		code = typescript`
			interface ${name} {}
		`;
	} else {
		code = typescript`
			interface ${name} {}
		`;
	}

	return {
		name,
		code,
	};
}
