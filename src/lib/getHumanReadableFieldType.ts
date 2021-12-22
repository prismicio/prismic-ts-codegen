import type { CustomTypeModelField } from "@prismicio/types";
import { CustomTypeModelLinkSelectType } from "@prismicio/types";

type GetFieldHumanReadableTypeConfig = {
	model: CustomTypeModelField;
};

export const getHumanReadableFieldType = (
	config: GetFieldHumanReadableTypeConfig,
): string => {
	switch (config.model.type) {
		case "StructuredText": {
			const isTitleField =
				"single" in config.model.config &&
				config.model.config.single
					.split(",")
					.every((blockType) => /heading/.test(blockType));

			return isTitleField ? "Title" : "Rich Text";
		}

		case "IntegrationFields": {
			return `Integration Fields (Catalog: \`${config.model.config.catalog}\`)`;
		}

		case "Link": {
			switch (config.model.config.select) {
				case CustomTypeModelLinkSelectType.Document: {
					return "Content Relationship";
				}

				case CustomTypeModelLinkSelectType.Media: {
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
			return config.model.type;
		}
	}
};
