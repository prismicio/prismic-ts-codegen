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
				config.model.config &&
				"single" in config.model.config &&
				config.model.config.single &&
				config.model.config.single
					.split(",")
					.every((blockType) => /heading/.test(blockType));

			return isTitleField ? "Title" : "Rich Text";
		}

		case "IntegrationFields": {
			const catalog = config.model.config?.catalog;

			return `Integration Fields (Catalog: ${
				catalog ? `\`${catalog}\`` : "*unknown*"
			})`;
		}

		case "Link": {
			switch (config.model.config?.select) {
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
