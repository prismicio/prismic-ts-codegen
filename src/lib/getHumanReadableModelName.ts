import type {
	CustomTypeModel,
	CustomTypeModelField,
	CustomTypeModelSlice,
	SharedSliceModel,
} from "@prismicio/client";

type GetModelHumanNameArgs = {
	name: string;
	model:
		| CustomTypeModel
		| SharedSliceModel
		| CustomTypeModelField
		| CustomTypeModelSlice;
};

export const getHumanReadableModelName = (
	args: GetModelHumanNameArgs,
): string => {
	if ("json" in args.model) {
		// Custom type model

		return args.model.label || args.model.id;
	} else if ("type" in args.model && args.model.type === "SharedSlice") {
		// Shared Slice model

		return args.model.name;
	} else if ("type" in args.model && args.model.type === "Slice") {
		// Legacy Slice model

		return args.model.fieldset || args.name;
	} else if ("type" in args.model) {
		// Field model

		if (args.model.config && "label" in args.model.config) {
			// Non-Slice Zone fields
			return args.model.config.label || args.name;
		} else if (args.model.config && "fieldset" in args.model) {
			// Slice Zone
			return args.model.fieldset || args.name;
		}
	}

	return `\`${args.name}\``;
};
