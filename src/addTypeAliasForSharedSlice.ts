import type { SharedSliceModel } from "@prismicio/types";
import type { SourceFile, TypeAliasDeclaration } from "ts-morph";
import { stripIndent } from "common-tags";

import { addInterfacePropertiesForFields } from "./lib/addInterfacePropertiesForFields";
import { buildSharedSliceInterfaceName } from "./lib/buildSharedSliceInterfaceName";
import { pascalCase } from "./lib/pascalCase";

type AddTypeAliasForSharedSliceConfig = {
	sharedSliceModel: SharedSliceModel;
	sourceFile: SourceFile;
};

export const addTypeAliasForSharedSlice = (
	config: AddTypeAliasForSharedSliceConfig,
): TypeAliasDeclaration => {
	const variationTypeNames: string[] = [];

	for (const variation of config.sharedSliceModel.variations) {
		const primaryInterface = config.sourceFile.addInterface({
			name: pascalCase(
				`${buildSharedSliceInterfaceName({ id: config.sharedSliceModel.id })} ${
					variation.id
				} Primary`,
			),
		});
		addInterfacePropertiesForFields({
			interface: primaryInterface,
			sourceFile: config.sourceFile,
			fields: variation.primary,
			rootModel: config.sharedSliceModel,
		});

		const itemInterface = config.sourceFile.addInterface({
			name: pascalCase(
				`${buildSharedSliceInterfaceName({ id: config.sharedSliceModel.id })} ${
					variation.id
				} Item`,
			),
		});
		addInterfacePropertiesForFields({
			interface: itemInterface,
			sourceFile: config.sourceFile,
			fields: variation.items,
			rootModel: config.sharedSliceModel,
		});

		const variationType = config.sourceFile.addTypeAlias({
			name: pascalCase(
				`${buildSharedSliceInterfaceName({
					id: config.sharedSliceModel.id,
				})} ${variation.id}`,
			),
			type: `prismicT.SharedSliceVariation<"${
				variation.id
			}", ${primaryInterface.getName()}, ${itemInterface.getName()}>`,
		});

		variationTypeNames.push(variationType.getName());
	}

	return config.sourceFile.addTypeAlias({
		name: pascalCase(
			buildSharedSliceInterfaceName({
				id: config.sharedSliceModel.id,
			}),
		),
		type: `prismicT.SharedSlice<"${
			config.sharedSliceModel.id
		}", ${variationTypeNames.join(" | ")}>`,
		docs: [
			{
				description: stripIndent`
					"${config.sharedSliceModel.name}" Prismic Shared Slice (API ID: \`${config.sharedSliceModel.id}\`)

					Description: ${config.sharedSliceModel.description}
				`,
			},
		],
	});
};
