#!/usr/bin/env node

import { writeFileSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { Project } from 'ts-morph';
import fg from 'fast-glob';
import meow from 'meow';
import { pascalCase as pascalCase$1, pascalCaseTransformMerge } from 'pascal-case';
import { stripIndent } from 'common-tags';
import prettier from 'prettier';

const CustomTypeModelLinkSelectType = {
  Document: "document",
  Media: "media"
};
const CustomTypeModelSliceType = {
  Slice: "Slice",
  SharedSlice: "SharedSlice"
};

const pascalCase = (input) => pascalCase$1(input, {
  transform: pascalCaseTransformMerge
});

const buildSharedSliceInterfaceName = (config) => {
  return pascalCase(`${config.id} Slice`);
};

const buildFieldDocs = (config) => {
  return [
    {
      description: (writer) => {
        if ("label" in config.field.config && config.field.config.label) {
          writer.write(`${config.field.config.label} field`);
        }
        writer.spaceIfLastNot();
        writer.write(`(type: ${config.field.type})`);
        writer.writeLine("");
        if ("placeholder" in config.field.config && config.field.config.placeholder) {
          writer.writeLine(`Placeholder: ${config.field.config.placeholder}`);
        }
        if ("catalog" in config.field.config) {
          writer.writeLine(`Catalog: ${config.field.config.catalog}`);
        }
      }
    }
  ];
};
const addInterfacePropertyFromField = (config) => {
  switch (config.field.type) {
    case "UID": {
      break;
    }
    case "Boolean": {
      config.interface.addProperty({
        name: config.name,
        type: "prismicT.BooleanField",
        docs: buildFieldDocs({ field: config.field })
      });
      break;
    }
    case "Color": {
      config.interface.addProperty({
        name: config.name,
        type: "prismicT.ColorField",
        docs: buildFieldDocs({ field: config.field })
      });
      break;
    }
    case "Date": {
      config.interface.addProperty({
        name: config.name,
        type: "prismicT.DateField",
        docs: buildFieldDocs({ field: config.field })
      });
      break;
    }
    case "Embed": {
      config.interface.addProperty({
        name: config.name,
        type: "prismicT.EmbedField",
        docs: buildFieldDocs({ field: config.field })
      });
      break;
    }
    case "GeoPoint": {
      config.interface.addProperty({
        name: config.name,
        type: "prismicT.GeoPointField",
        docs: buildFieldDocs({ field: config.field })
      });
      break;
    }
    case "Image": {
      if (config.field.config.thumbnails.length > 0) {
        const thumbnailNames = config.field.config.thumbnails.map((thumbnail) => `"${thumbnail.name}"`).join(" | ");
        config.interface.addProperty({
          name: config.name,
          type: `prismicT.ImageField<${thumbnailNames}>`,
          docs: buildFieldDocs({ field: config.field })
        });
      } else {
        config.interface.addProperty({
          name: config.name,
          type: "prismicT.ImageField",
          docs: buildFieldDocs({ field: config.field })
        });
      }
      break;
    }
    case "IntegrationFields": {
      config.interface.addProperty({
        name: config.name,
        type: "prismicT.IntegrationFields",
        docs: buildFieldDocs({ field: config.field })
      });
      break;
    }
    case "Link": {
      switch (config.field.config.select) {
        case CustomTypeModelLinkSelectType.Document: {
          config.interface.addProperty({
            name: config.name,
            type: config.field.config.customtypes && config.field.config.customtypes.length > 0 ? `prismicT.RelationField<${config.field.config.customtypes.map((type) => `"${type}"`).join(" | ")}>` : "prismicT.RelationField",
            docs: buildFieldDocs({ field: config.field })
          });
          break;
        }
        case CustomTypeModelLinkSelectType.Media: {
          config.interface.addProperty({
            name: config.name,
            type: "prismicT.LinkToMediaField",
            docs: buildFieldDocs({ field: config.field })
          });
          break;
        }
        default: {
          config.interface.addProperty({
            name: config.name,
            type: "prismicT.LinkField",
            docs: buildFieldDocs({ field: config.field })
          });
        }
      }
      break;
    }
    case "Number": {
      config.interface.addProperty({
        name: config.name,
        type: "prismicT.NumberField",
        docs: buildFieldDocs({ field: config.field })
      });
      break;
    }
    case "StructuredText": {
      const isTitleField = "single" in config.field.config && config.field.config.single.split(",").every((blockType) => /heading/.test(blockType));
      if (isTitleField) {
        config.interface.addProperty({
          name: config.name,
          type: "prismicT.TitleField",
          docs: buildFieldDocs({ field: config.field })
        });
      } else {
        config.interface.addProperty({
          name: config.name,
          type: "prismicT.RichTextField",
          docs: buildFieldDocs({ field: config.field })
        });
      }
      break;
    }
    case "Select": {
      const options = config.field.config.options.map((option) => `"${option}"`).join(" | ");
      const hasDefault = Boolean(config.field.config.default_value);
      if (hasDefault) {
        config.interface.addProperty({
          name: config.name,
          type: `prismicT.SelectField<${options}, "filled">`,
          docs: buildFieldDocs({ field: config.field })
        });
      } else {
        config.interface.addProperty({
          name: config.name,
          type: `prismicT.SelectField<${options}>`,
          docs: buildFieldDocs({ field: config.field })
        });
      }
      break;
    }
    case "Text": {
      config.interface.addProperty({
        name: config.name,
        type: "prismicT.KeyTextField",
        docs: buildFieldDocs({ field: config.field })
      });
      break;
    }
    case "Timestamp": {
      config.interface.addProperty({
        name: config.name,
        type: "prismicT.TimestampField",
        docs: buildFieldDocs({ field: config.field })
      });
      break;
    }
    case "Group": {
      const itemInterface = config.sourceFile.addInterface({
        name: pascalCase(`${config.rootModel.id} Document Data ${config.name} Item`)
      });
      addInterfacePropertiesForFields({
        interface: itemInterface,
        sourceFile: config.sourceFile,
        fields: config.field.config.fields,
        rootModel: config.rootModel
      });
      config.interface.addProperty({
        name: config.name,
        type: `prismicT.GroupField<Simplify<${itemInterface.getName()}>>`,
        docs: buildFieldDocs({ field: config.field })
      });
      break;
    }
    case "Slices": {
      const choiceInterfaceNames = [];
      for (const choiceId in config.field.config.choices) {
        const choice = config.field.config.choices[choiceId];
        if (choice.type === CustomTypeModelSliceType.SharedSlice) {
          choiceInterfaceNames.push(buildSharedSliceInterfaceName({ id: choiceId }));
        } else if (choice.type === CustomTypeModelSliceType.Slice) {
          let primaryInterface;
          if (Object.keys(choice["non-repeat"]).length > 0) {
            primaryInterface = config.sourceFile.addInterface({
              name: pascalCase(`${config.rootModel.id} Document Data ${config.name} ${choiceId} Slice Primary`)
            });
            addInterfacePropertiesForFields({
              interface: primaryInterface,
              sourceFile: config.sourceFile,
              fields: choice["non-repeat"],
              rootModel: config.rootModel
            });
          }
          if (Object.keys(choice.repeat).length > 0) {
            const itemInterface2 = config.sourceFile.addInterface({
              name: pascalCase(`${config.rootModel.id} Document Data ${config.name} ${choiceId} Slice Item`)
            });
            addInterfacePropertiesForFields({
              interface: itemInterface2,
              sourceFile: config.sourceFile,
              fields: choice.repeat,
              rootModel: config.rootModel
            });
          }
          const sliceType = config.sourceFile.addTypeAlias({
            name: pascalCase(`${config.rootModel.id} Document Data ${config.name} ${choiceId} Slice`),
            type: `prismicT.Slice<"${choiceId}", ${primaryInterface ? `Simplify<${primaryInterface.getName()}>` : "Record<string, never>"}, ${"never"}>`
          });
          choiceInterfaceNames.push(sliceType.getName());
        }
      }
      const slicesType = config.sourceFile.addTypeAlias({
        name: pascalCase(`${config.rootModel.id} Document Data ${config.name} Slice`),
        type: choiceInterfaceNames.length > 0 ? choiceInterfaceNames.join(" | ") : "never"
      });
      config.interface.addProperty({
        name: config.name,
        type: `prismicT.SliceZone<${slicesType.getName()}>`,
        docs: buildFieldDocs({ field: config.field })
      });
      break;
    }
    default: {
      config.interface.addProperty({
        name: config.name,
        type: "unknown",
        docs: buildFieldDocs({ field: config.field })
      });
    }
  }
};
const addInterfacePropertiesForFields = (config) => {
  for (const name in config.fields) {
    addInterfacePropertyFromField({
      ...config,
      name,
      field: config.fields[name]
    });
  }
};

const collectCustomTypeFields = (model) => {
  return Object.assign({}, ...Object.values(model.json));
};
const addTypeAliasForCustomType = (config) => {
  const fields = collectCustomTypeFields(config.model);
  const hasUIDField = "uid" in fields;
  const dataInterface = config.sourceFile.addInterface({
    name: pascalCase(`${config.model.id} Document Data`)
  });
  addInterfacePropertiesForFields({
    fields,
    interface: dataInterface,
    sourceFile: config.sourceFile,
    rootModel: config.model
  });
  return config.sourceFile.addTypeAlias({
    name: pascalCase(`${config.model.id} Document`),
    typeParameters: [
      {
        name: "Lang",
        constraint: "string",
        default: "string"
      }
    ],
    type: hasUIDField ? `prismicT.PrismicDocumentWithUID<${dataInterface.getName()}, "${config.model.id}", Lang>` : `prismicT.PrismicDocumentWithoutUID<${dataInterface.getName()}, "${config.model.id}", Lang>`,
    docs: [
      {
        description: `${config.model.label} Prismic document (API ID: \`${config.model.id}\`)`,
        tags: [
          {
            tagName: "typeParam",
            text: "Lang - Language API ID of the document."
          }
        ]
      }
    ],
    isExported: true
  });
};

const addTypeAliasForSharedSlice = (config) => {
  const variationTypeNames = [];
  for (const variation of config.model.variations) {
    let primaryInterface;
    if (Object.keys(variation.primary).length > 0) {
      primaryInterface = config.sourceFile.addInterface({
        name: pascalCase(`${buildSharedSliceInterfaceName({ id: config.model.id })} ${variation.id} Primary`)
      });
      addInterfacePropertiesForFields({
        interface: primaryInterface,
        sourceFile: config.sourceFile,
        fields: variation.primary,
        rootModel: config.model
      });
    }
    let itemInterface;
    if (Object.keys(variation.items).length > 0) {
      itemInterface = config.sourceFile.addInterface({
        name: pascalCase(`${buildSharedSliceInterfaceName({ id: config.model.id })} ${variation.id} Item`)
      });
      addInterfacePropertiesForFields({
        interface: itemInterface,
        sourceFile: config.sourceFile,
        fields: variation.items,
        rootModel: config.model
      });
    }
    const variationType = config.sourceFile.addTypeAlias({
      name: pascalCase(`${buildSharedSliceInterfaceName({
        id: config.model.id
      })} ${variation.id}`),
      type: `prismicT.SharedSliceVariation<"${variation.id}", ${primaryInterface ? `Simplify<${primaryInterface.getName()}>` : "Record<string, never>"}, ${itemInterface ? `Simplify<${itemInterface.getName()}>` : "never"}>`
    });
    variationTypeNames.push(variationType.getName());
  }
  return config.sourceFile.addTypeAlias({
    name: pascalCase(buildSharedSliceInterfaceName({
      id: config.model.id
    })),
    type: variationTypeNames.length > 0 ? `prismicT.SharedSlice<"${config.model.id}", ${variationTypeNames.join(" | ")}>` : "never",
    docs: [
      {
        description: stripIndent`
					"${config.model.name}" Prismic Shared Slice (API ID: \`${config.model.id}\`)

					Description: ${config.model.description}
				`
      }
    ],
    isExported: true
  });
};

const BLANK_LINE_IDENTIFIER = "// ___BLANK_LINE_TO_BE_REPLACED___";
const NON_EDITABLE_FILE_HEADER = stripIndent`
	// Code generated by prismic-typescript-generator. DO NOT EDIT.
	${BLANK_LINE_IDENTIFIER}
`;

const createTypesFile = (config) => {
  const sourceFile = config.project.createSourceFile("types.d.ts");
  sourceFile.addImportDeclaration({
    moduleSpecifier: "@prismicio/types",
    namespaceImport: "prismicT",
    isTypeOnly: true,
    leadingTrivia: NON_EDITABLE_FILE_HEADER
  });
  sourceFile.addStatements(BLANK_LINE_IDENTIFIER);
  sourceFile.addTypeAlias({
    name: "Simplify",
    typeParameters: [
      {
        name: "T"
      }
    ],
    type: `{ [KeyType in keyof T]: T[KeyType] }`
  });
  for (const model of config.customTypeModels) {
    addTypeAliasForCustomType({ model, sourceFile });
  }
  for (const model of config.sharedSliceModels) {
    addTypeAliasForSharedSlice({ model, sourceFile });
  }
  return sourceFile;
};

const formatBlankLines = (input) => {
  return input.replace(new RegExp(BLANK_LINE_IDENTIFIER, "g"), "");
};

const formatFileText = (input) => {
  return prettier.format(formatBlankLines(input), {
    parser: "typescript"
  });
};

const getSourceFileText = (sourceFile) => {
  const text = sourceFile.print();
  return formatFileText(text);
};

const cli = meow(`
	Usage
	  $ prismic-typegen

	Options
	  --customTypes, -c   Paths to Custom Type JSON models (supports globs)
	  --sharedSlices, -s  Paths to Shared Slice JSON models (supports globs)
	  --write, -w         Write generated types to a file
	`, {
  importMeta: import.meta,
  flags: {
    customTypes: {
      type: "string",
      alias: "c"
    },
    sharedSlices: {
      type: "string",
      alias: "s"
    },
    write: {
      type: "string",
      alias: "w"
    }
  }
});
const readModelsFromGlobs = async (globs) => {
  const paths = await fg(globs.split(",").map((path) => path.trim()));
  return paths.map((path) => {
    const raw = readFileSync(path, "utf8");
    return JSON.parse(raw);
  });
};
const main = async () => {
  const customTypeModels = cli.flags.customTypes ? await readModelsFromGlobs(cli.flags.customTypes) : [];
  const sharedSliceModels = cli.flags.sharedSlices ? await readModelsFromGlobs(cli.flags.sharedSlices) : [];
  const project = new Project();
  const typesFile = createTypesFile({
    project,
    customTypeModels,
    sharedSliceModels
  });
  const contents = getSourceFileText(typesFile);
  if (cli.flags.write) {
    writeFileSync(resolve(cli.flags.write), contents);
  } else {
    console.log(contents);
  }
};
main().catch((error) => console.error(error));
//# sourceMappingURL=cli.mjs.map
