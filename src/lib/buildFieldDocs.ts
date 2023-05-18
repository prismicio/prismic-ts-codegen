import type { JSDocableNodeStructure } from "ts-morph";

import { PathElement } from "../types";
import type {
	CustomTypeModel,
	CustomTypeModelField,
	CustomTypeModelSlice,
	SharedSliceModel,
} from "@prismicio/types";

import { getAPIIDPath } from "./getAPIIDPath";
import { getFieldDocumentationURL } from "./getFieldDocumentationURL";
import { getHumanReadableFieldPath } from "./getHumanReadableFieldPath";
import { getHumanReadableFieldType } from "./getHumanReadableFieldType";
import { getHumanReadableModelName } from "./getHumanReadableModelName";
import { writeFieldDocsDescription } from "./writeFieldDocsDescription";

type BuildFieldDocsConfig = {
	id: string;
	model: CustomTypeModelField;
	path: [
		PathElement<CustomTypeModel | SharedSliceModel>,
		...PathElement<CustomTypeModelField | CustomTypeModelSlice>[],
	];
	tabName?: string;
};

export const buildFieldDocs = (
	config: BuildFieldDocsConfig,
): NonNullable<JSDocableNodeStructure["docs"]> => {
	return [
		{
			description: (writer) => {
				const name = getHumanReadableModelName({
					id: config.id,
					model: config.model,
				});
				const humanReadablePath = getHumanReadableFieldPath({
					path: config.path,
				});

				const fieldType = getHumanReadableFieldType({
					model: config.model,
				});

				const placeholder =
					config.model.config &&
					"placeholder" in config.model.config &&
					config.model.config.placeholder
						? config.model.config.placeholder
						: `*None*`;

				const defaultValue =
					config.model.config && "default_value" in config.model.config
						? config.model.config.default_value
						: undefined;

				const apiIDPath = getAPIIDPath({
					path: [...config.path, { id: config.id, model: config.model }],
				});

				writeFieldDocsDescription({
					writer,
					description: `${name} field in *${humanReadablePath}*`,
					fieldType,
					placeholder,
					defaultValue,
					apiIDPath,
					tabName: config.tabName,
					documentationURL: getFieldDocumentationURL({ model: config.model }),
				});
			},
		},
	];
};
