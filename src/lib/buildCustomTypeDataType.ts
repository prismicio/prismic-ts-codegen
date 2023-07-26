import type { CustomTypeModel } from "@prismicio/client";
import { source } from "common-tags";

import { buildTypeName } from "../lib/buildTypeName";

import { AuxiliaryType, FieldConfigs } from "../types";

import { buildFieldProperties } from "./buildFieldProperties";
import { getHumanReadableModelName } from "./getHumanReadableModelName";

type BuildCustomTypeDataTypeArgs = {
	model: CustomTypeModel;
	fieldConfigs: FieldConfigs;
};

type BuildCustomTypeDataTypeReturnValue = {
	name: string;
	code: string;
	auxiliaryTypes: AuxiliaryType[];
	contentTypeNames: string[];
};

export function buildCustomTypeDataType(
	args: BuildCustomTypeDataTypeArgs,
): BuildCustomTypeDataTypeReturnValue {
	let code = "";
	const auxiliaryTypes: AuxiliaryType[] = [];
	const contentTypeNames: string[] = [];

	const name = buildTypeName(args.model.id, "Document", "Data");
	const humanReadableName = getHumanReadableModelName({
		name: args.model.id,
		model: args.model,
	});

	let fieldProperties = "";

	for (const tabName in args.model.json) {
		const { uid: _uid, ...fields } = args.model.json[tabName];

		const tabFieldProperties = buildFieldProperties({
			fields,
			fieldConfigs: args.fieldConfigs,
			path: [
				{
					name: args.model.id,
					model: args.model,
				},
			],
			tabName,
		});

		fieldProperties += tabFieldProperties.code;

		auxiliaryTypes.push(...tabFieldProperties.auxiliaryTypes);
		contentTypeNames.push(...tabFieldProperties.contentTypeNames);
	}

	if (fieldProperties) {
		code = source`
			/**
			 * Content for ${humanReadableName} documents
			 */
			interface ${name} {
				${fieldProperties}
			}
		`;
	} else {
		code = `interface ${name} {}`;
	}

	return {
		name,
		code,
		auxiliaryTypes,
		contentTypeNames,
	};
}
