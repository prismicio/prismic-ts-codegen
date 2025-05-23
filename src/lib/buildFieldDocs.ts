import type { CustomTypeModelField } from "@prismicio/client";

import { FieldPath } from "../types";

import { FIELD_DOCUMENTATION_URLS } from "../constants";

import { addLine } from "./addLine";
import { getAPIIDPath } from "./getAPIIDPath";
import { getHumanReadableModelName } from "./getHumanReadableModelName";
import { getHumanReadablePath } from "./getHumanReadablePath";

type GetFieldHumanReadableTypeArgs = {
	field: CustomTypeModelField;
};

function getHumanReadableFieldType(
	args: GetFieldHumanReadableTypeArgs,
): string {
	switch (args.field.type) {
		case "StructuredText": {
			return "Rich Text";
		}

		case "IntegrationFields": {
			const catalog = args.field.config?.catalog;

			return `Integration Fields (Catalog: ${
				catalog ? `\`${catalog}\`` : "*unknown*"
			})`;
		}

		case "Link": {
			switch (args.field.config?.select) {
				case "document": {
					return "Content Relationship";
				}

				case "media": {
					return "Link to Media";
				}

				default: {
					return "Link";
				}
			}
		}

		case "Slices": {
			return "Slice Zone";
		}

		default: {
			return args.field.type;
		}
	}
}

type getDocumentationURLArgs = {
	field: CustomTypeModelField;
};

function getDocumentationURL(args: getDocumentationURLArgs) {
	switch (args.field.type) {
		case "Link": {
			const urls = FIELD_DOCUMENTATION_URLS.Link;

			switch (args.field.config?.select) {
				case "document": {
					return urls.contentRelationship;
				}

				case "media": {
					return urls.linkToMedia;
				}

				default: {
					return urls.link;
				}
			}
		}

		default: {
			const url =
				FIELD_DOCUMENTATION_URLS[
					args.field.type as keyof typeof FIELD_DOCUMENTATION_URLS
				];

			if (typeof url === "string") {
				return url;
			}
		}
	}
}

type BuildFieldDocsArgs = {
	name: string;
	field: CustomTypeModelField;
	path: FieldPath;
	tabName?: string;
};

export function buildFieldDocs(args: BuildFieldDocsArgs): string {
	let result = "/**";

	const humanReadableName = getHumanReadableModelName({
		model: args.field,
		name: args.name,
	});
	const humanReadablePath = getHumanReadablePath({ path: args.path });
	const humanReadableFieldType = getHumanReadableFieldType({
		field: args.field,
	});

	result = addLine(
		` * ${humanReadableName} field in *${humanReadablePath}*`,
		result,
	);

	result = addLine(" *", result);

	result = addLine(` * - **Field Type**: ${humanReadableFieldType}`, result);

	const placeholder =
		(args.field.config &&
			"placeholder" in args.field.config &&
			args.field.config.placeholder) ||
		`*None*`;
	result = addLine(` * - **Placeholder**: ${placeholder}`, result);

	const defaultValue =
		args.field.config && "default_value" in args.field.config
			? args.field.config.default_value
			: undefined;
	if (defaultValue !== undefined) {
		const stringifiedDefaultValue =
			typeof defaultValue === "boolean" ? `${defaultValue}` : defaultValue;

		result = addLine(
			` * - **Default Value**: ${stringifiedDefaultValue}`,
			result,
		);
	}

	const apiIDPath = getAPIIDPath({
		path: [...args.path, { name: args.name, model: args.field }],
	});
	result = addLine(` * - **API ID Path**: ${apiIDPath}`, result);

	if (args.tabName) {
		result = addLine(` * - **Tab**: ${args.tabName}`, result);
	}

	const documentationURL = getDocumentationURL({ field: args.field });
	if (documentationURL) {
		result = addLine(` * - **Documentation**: ${documentationURL}`, result);
	}

	result = addLine(" */", result);

	return result;
}
