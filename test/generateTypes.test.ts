import { expect, it } from "vitest";

import { parseSourceFile } from "./__testutils__/parseSourceFile";

import * as lib from "../src";

it("imports @prismicio/types as prismic as the default types provider", () => {
	const res = lib.generateTypes();
	const file = parseSourceFile(res);

	const importDeclaration =
		file.getImportDeclarationOrThrow("@prismicio/types");

	expect(importDeclaration.getNamespaceImportOrThrow().getText()).toBe(
		"prismic",
	);
	expect(importDeclaration.isTypeOnly()).toBe(true);
});

it("imports @prismicio/client as prismic if the `@prismicio/client` types provider is used", () => {
	const res = lib.generateTypes({ typesProvider: "@prismicio/client" });
	const file = parseSourceFile(res);

	const importDeclaration =
		file.getImportDeclarationOrThrow("@prismicio/client");

	expect(importDeclaration.getNamespaceImportOrThrow().getText()).toBe(
		"prismic",
	);
	expect(importDeclaration.isTypeOnly()).toBe(true);
});

it("imports @prismicio/types as prismic if the `@prismicio/types` types provider is used", () => {
	const res = lib.generateTypes({ typesProvider: "@prismicio/types" });
	const file = parseSourceFile(res);

	const importDeclaration =
		file.getImportDeclarationOrThrow("@prismicio/types");

	expect(importDeclaration.getNamespaceImportOrThrow().getText()).toBe(
		"prismic",
	);
	expect(importDeclaration.isTypeOnly()).toBe(true);
});

it("includes AllDocumentTypes type alias if Custom Types are provided", (ctx) => {
	const res = lib.generateTypes({
		customTypeModels: [
			ctx.mock.model.customType({ id: "foo" }),
			ctx.mock.model.customType({ id: "bar" }),
		],
	});

	const file = parseSourceFile(res);
	const typeAlias = file.getTypeAliasOrThrow("AllDocumentTypes");

	expect(typeAlias.getTypeNodeOrThrow().getText()).toBe(
		"FooDocument | BarDocument",
	);
	expect(typeAlias.isExported()).toBe(true);
});

it("includes @prismicio/client module declaration including a CreateClient interface if configured", (ctx) => {
	const res = lib.generateTypes({
		clientIntegration: {
			includeCreateClientInterface: true,
		},
		customTypeModels: [ctx.mock.model.customType({ id: "foo" })],
	});

	const file = parseSourceFile(res);

	const importDeclaration =
		file.getImportDeclarationOrThrow("@prismicio/client");

	expect(importDeclaration.getNamespaceImportOrThrow().getText()).toBe(
		"prismicClient",
	);
	expect(importDeclaration.isTypeOnly()).toBe(true);

	const createClientInterface = file
		.getModuleOrThrow('"@prismicio/client"')
		.getInterfaceOrThrow("CreateClient");
	const callSignatures = createClientInterface.getCallSignatures();
	const firstCallSignature = callSignatures[0];

	expect(callSignatures.length).toBe(1);

	expect(
		firstCallSignature
			.getParameterOrThrow("repositoryNameOrEndpoint")
			.getTypeNodeOrThrow()
			.getText(),
	).toBe(`string`);

	expect(
		firstCallSignature
			.getParameterOrThrow("options")
			.getTypeNodeOrThrow()
			.getText(),
	).toBe(`prismicClient.ClientConfig`);
	expect(firstCallSignature.getParameterOrThrow("options").isOptional()).toBe(
		true,
	);

	expect(firstCallSignature.getReturnTypeNodeOrThrow().getText()).toBe(
		"prismicClient.Client<AllDocumentTypes>",
	);

	expect(() => {
		file.getImportDeclarationOrThrow("@prismicio/client");
	}).not.throws("imports `@prismicio/client`");
});

it("includes untyped `@prismicio/client` in CreateClient interface if no Custom Type models are provided", () => {
	const res = lib.generateTypes({
		clientIntegration: {
			includeCreateClientInterface: true,
		},
		customTypeModels: [],
	});

	const file = parseSourceFile(res);
	const createClientInterface = file
		.getModuleOrThrow('"@prismicio/client"')
		.getInterfaceOrThrow("CreateClient");
	const callSignatures = createClientInterface.getCallSignatures();

	expect(callSignatures[0].getReturnTypeNodeOrThrow().getText()).toBe(
		"prismicClient.Client",
	);
});

it("includes @prismicio/client Content namespace containing all document and Slice types if configured", (ctx) => {
	const res = lib.generateTypes({
		clientIntegration: {
			includeContentNamespace: true,
		},
		customTypeModels: [ctx.mock.model.customType({ id: "foo" })],
		sharedSliceModels: [
			ctx.mock.model.sharedSlice({
				id: "bar",
				variations: [ctx.mock.model.sharedSliceVariation({ id: "baz" })],
			}),
		],
	});

	const file = parseSourceFile(res);
	const contentNamespace = file
		.getModuleOrThrow('"@prismicio/client"')
		.getModuleOrThrow("Content");

	const exportSymbolNames = contentNamespace
		.getExportSymbols()
		.map((exportSymbol) => {
			return exportSymbol.getName();
		});

	// Documents
	expect(exportSymbolNames.includes("FooDocument")).toBe(true);
	expect(exportSymbolNames.includes("FooDocumentData")).toBe(true);
	expect(exportSymbolNames.includes("AllDocumentTypes")).toBe(true);

	// Slices
	expect(exportSymbolNames.includes("BarSliceBaz")).toBe(true);
	expect(exportSymbolNames.includes("BarSliceVariation")).toBe(true);
	expect(exportSymbolNames.includes("BarSlice")).toBe(true);
});

it("includes empty @prismicio/client Content namespace if configured and no models are provided", () => {
	const res = lib.generateTypes({
		clientIntegration: {
			includeContentNamespace: true,
		},
	});

	const file = parseSourceFile(res);
	const contentNamespace = file
		.getModuleOrThrow('"@prismicio/client"')
		.getModuleOrThrow("Content");

	const exportSymbolNames = contentNamespace
		.getExportSymbols()
		.map((exportSymbol) => {
			return exportSymbol.getName();
		});

	expect(exportSymbolNames.length).toBe(0);
});

it("imports @prismicio/client as `prismicClient` if the `@prismicio/types` types provider is used with the CreateClient interface", (ctx) => {
	const res = lib.generateTypes({
		clientIntegration: {
			includeCreateClientInterface: true,
		},
		typesProvider: "@prismicio/types",
		customTypeModels: [ctx.mock.model.customType({ id: "foo" })],
	});

	const file = parseSourceFile(res);

	const importDeclaration =
		file.getImportDeclarationOrThrow("@prismicio/client");

	expect(importDeclaration.getNamespaceImportOrThrow().getText()).toBe(
		"prismicClient",
	);
	expect(importDeclaration.isTypeOnly()).toBe(true);

	const createClientInterface = file
		.getModuleOrThrow('"@prismicio/client"')
		.getInterfaceOrThrow("CreateClient");
	const callSignatures = createClientInterface.getCallSignatures();
	const firstCallSignature = callSignatures[0];

	expect(callSignatures.length).toBe(1);

	expect(
		firstCallSignature
			.getParameterOrThrow("options")
			.getTypeNodeOrThrow()
			.getText(),
	).toBe(`prismicClient.ClientConfig`);

	expect(firstCallSignature.getReturnTypeNodeOrThrow().getText()).toBe(
		"prismicClient.Client<AllDocumentTypes>",
	);

	expect(() => {
		file.getImportDeclarationOrThrow("@prismicio/client");
	}).not.throws("imports `@prismicio/client`");
});

it("uses the existing prismic import if the `@prismicio/client` types provider is used with the CreateClient interface", (ctx) => {
	const res = lib.generateTypes({
		clientIntegration: {
			includeCreateClientInterface: true,
		},
		typesProvider: "@prismicio/client",
		customTypeModels: [ctx.mock.model.customType({ id: "foo" })],
	});

	const file = parseSourceFile(res);

	const importDeclaration =
		file.getImportDeclarationOrThrow("@prismicio/client");

	expect(importDeclaration.getNamespaceImportOrThrow().getText()).toBe(
		"prismic",
	);
	expect(importDeclaration.isTypeOnly()).toBe(true);

	const createClientInterface = file
		.getModuleOrThrow('"@prismicio/client"')
		.getInterfaceOrThrow("CreateClient");
	const callSignatures = createClientInterface.getCallSignatures();
	const firstCallSignature = callSignatures[0];

	expect(callSignatures.length).toBe(1);

	expect(
		firstCallSignature
			.getParameterOrThrow("options")
			.getTypeNodeOrThrow()
			.getText(),
	).toBe(`prismic.ClientConfig`);

	expect(firstCallSignature.getReturnTypeNodeOrThrow().getText()).toBe(
		"prismic.Client<AllDocumentTypes>",
	);

	expect(() => {
		file.getImportDeclarationOrThrow("@prismicio/client");
	}).not.throws("imports `@prismicio/client`");
});

it("outputs correct code style", (ctx) => {
	const customTypeModels = Array.from({ length: 5 }, () =>
		ctx.mock.model.customType({
			fields: {
				...ctx.mock.model.buildMockGroupFieldMap(),
				group: ctx.mock.model.group({
					fields: ctx.mock.model.buildMockGroupFieldMap(),
				}),
				sliceZone: ctx.mock.model.sliceZone({
					choices: {
						foo: ctx.mock.model.slice({
							nonRepeatFields: ctx.mock.model.buildMockGroupFieldMap(),
							repeatFields: ctx.mock.model.buildMockGroupFieldMap(),
						}),
					},
				}),
			},
		}),
	);
	const sharedSliceModels = Array.from({ length: 5 }, () =>
		ctx.mock.model.sharedSlice({
			variations: [
				ctx.mock.model.sharedSliceVariation({
					primaryFields: ctx.mock.model.buildMockGroupFieldMap(),
					itemsFields: ctx.mock.model.buildMockGroupFieldMap(),
				}),
			],
		}),
	);

	const res = lib.generateTypes({
		customTypeModels,
		sharedSliceModels,
		clientIntegration: {
			includeContentNamespace: true,
			includeCreateClientInterface: true,
		},
	});

	expect(res).toMatchSnapshot();
});

it("cached types are the same as uncached types", (ctx) => {
	const customTypeModels = [
		ctx.mock.model.customType({
			fields: ctx.mock.model.buildMockGroupFieldMap(),
		}),
		ctx.mock.model.customType({
			fields: ctx.mock.model.buildMockGroupFieldMap(),
		}),
	];

	const sharedSliceModels = [
		ctx.mock.model.sharedSlice({
			variations: [
				ctx.mock.model.sharedSliceVariation({
					primaryFields: ctx.mock.model.buildMockGroupFieldMap(),
					itemsFields: ctx.mock.model.buildMockGroupFieldMap(),
				}),
			],
		}),
		ctx.mock.model.sharedSlice({
			variations: [
				ctx.mock.model.sharedSliceVariation({
					primaryFields: ctx.mock.model.buildMockGroupFieldMap(),
					itemsFields: ctx.mock.model.buildMockGroupFieldMap(),
				}),
			],
		}),
	];

	const cached1 = lib.generateTypes({
		customTypeModels,
		sharedSliceModels,
		cache: true,
	});

	const cached2 = lib.generateTypes({
		customTypeModels,
		sharedSliceModels,
		cache: true,
	});

	const uncached = lib.generateTypes({
		customTypeModels,
		sharedSliceModels,
		cache: false,
	});

	expect(cached1).toBe(cached2);
	expect(cached1).toBe(uncached);
});
