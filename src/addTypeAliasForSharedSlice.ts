import type { SharedSliceModel } from "@prismicio/types";
import type {
	InterfaceDeclaration,
	SourceFile,
	TypeAliasDeclaration,
} from "ts-morph";
import { stripIndent } from "common-tags";

import { addInterfacePropertiesForFields } from "./lib/addInterfacePropertiesForFields";
import { buildSharedSliceInterfaceName } from "./lib/buildSharedSliceInterfaceName";
import { pascalCase } from "./lib/pascalCase";

type AddTypeAliasForSharedSliceConfig = {
	model: SharedSliceModel;
	sourceFile: SourceFile;
};

export const addTypeAliasForSharedSlice = (
	config: AddTypeAliasForSharedSliceConfig,
): TypeAliasDeclaration => {
	const variationTypeNames: string[] = [];

	for (const variation of config.model.variations) {
		let primaryInterface: InterfaceDeclaration | undefined;
		if (Object.keys(variation.primary).length > 0) {
			primaryInterface = config.sourceFile.addInterface({
				name: pascalCase(
					`${buildSharedSliceInterfaceName({ id: config.model.id })} ${
						variation.id
					} Primary`,
				),
			});
			addInterfacePropertiesForFields({
				interface: primaryInterface,
				sourceFile: config.sourceFile,
				fields: variation.primary,
				rootModel: config.model,
			});
		}

		let itemInterface: InterfaceDeclaration | undefined;
		if (Object.keys(variation.items).length > 0) {
			itemInterface = config.sourceFile.addInterface({
				name: pascalCase(
					`${buildSharedSliceInterfaceName({ id: config.model.id })} ${
						variation.id
					} Item`,
				),
			});
			addInterfacePropertiesForFields({
				interface: itemInterface,
				sourceFile: config.sourceFile,
				fields: variation.items,
				rootModel: config.model,
			});
		}

		const variationType = config.sourceFile.addTypeAlias({
			name: pascalCase(
				`${buildSharedSliceInterfaceName({
					id: config.model.id,
				})} ${variation.id}`,
			),
			type: `prismicT.SharedSliceVariation<"${variation.id}", ${
				primaryInterface
					? `Simplify<${primaryInterface.getName()}>`
					: "Record<string, never>"
			}, ${itemInterface ? `Simplify<${itemInterface.getName()}>` : "never"}>`,
		});

		variationTypeNames.push(variationType.getName());
	}

	return config.sourceFile.addTypeAlias({
		name: pascalCase(
			buildSharedSliceInterfaceName({
				id: config.model.id,
			}),
		),
		type:
			variationTypeNames.length > 0
				? `prismicT.SharedSlice<"${config.model.id}", ${variationTypeNames.join(
						" | ",
				  )}>`
				: "never",
		docs: [
			{
				description: stripIndent`
					"${config.model.name}" Prismic Shared Slice (API ID: \`${config.model.id}\`)

					Description: ${config.model.description}
				`,
			},
		],
		isExported: true,
	});
};
