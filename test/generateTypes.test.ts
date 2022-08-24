import test from "ava";
import * as prismicM from "@prismicio/mock";

import { parseSourceFile } from "./__testutils__/parseSourceFile";

import * as lib from "../src";

test('includes "DO NOT EDIT" header', (t) => {
	const res = lib.generateTypes();
	const file = parseSourceFile(res);

	const headerStatement = file.getStatementsWithComments()[0];

	t.is(headerStatement.getKindName(), "SingleLineCommentTrivia");
	t.regex(headerStatement.getText(), /DO NOT EDIT/);
});

test("imports @prismicio/types as prismicT", (t) => {
	const res = lib.generateTypes();
	const file = parseSourceFile(res);

	const importDeclaration =
		file.getImportDeclarationOrThrow("@prismicio/types");

	t.is(importDeclaration.getNamespaceImportOrThrow().getText(), "prismicT");
	t.true(importDeclaration.isTypeOnly());
});

test("includes AllDocumentTypes type alias if Custom Types are provided", (t) => {
	const mock = prismicM.createMockFactory({ seed: t.title });

	const res = lib.generateTypes({
		customTypeModels: [
			mock.model.customType({ id: "foo" }),
			mock.model.customType({ id: "bar" }),
		],
	});

	const file = parseSourceFile(res);
	const typeAlias = file.getTypeAliasOrThrow("AllDocumentTypes");

	t.is(typeAlias.getTypeNodeOrThrow().getText(), "FooDocument | BarDocument");
	t.true(typeAlias.isExported());
});

test("includes @prismicio/client module declaration including a CreateClient interface if configured", (t) => {
	const res = lib.generateTypes({
		clientIntegration: {
			includeCreateClientInterface: true,
		},
		customTypeModels: [prismicM.model.customType({ seed: t.title, id: "foo" })],
	});

	const file = parseSourceFile(res);
	const createClientInterface = file
		.getModuleOrThrow('"@prismicio/client"')
		.getInterfaceOrThrow("CreateClient");
	const callSignatures = createClientInterface.getCallSignatures();
	const firstCallSignature = callSignatures[0];

	t.is(callSignatures.length, 1);

	t.is(
		firstCallSignature
			.getParameterOrThrow("repositoryNameOrEndpoint")
			.getTypeNodeOrThrow()
			.getText(),
		`string`,
	);

	t.is(
		firstCallSignature
			.getParameterOrThrow("options")
			.getTypeNodeOrThrow()
			.getText(),
		`prismic.ClientConfig`,
	);
	t.true(firstCallSignature.getParameterOrThrow("options").isOptional());

	t.is(
		firstCallSignature.getReturnTypeNodeOrThrow().getText(),
		"prismic.Client<AllDocumentTypes>",
	);

	t.notThrows(() => {
		file.getImportDeclarationOrThrow("@prismicio/client");
	}, "imports `@prismicio/client`");
});

test("includes untyped `@prismicio/client` in CreateClient interface if no Custom Type models are provided", (t) => {
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

	t.is(
		callSignatures[0].getReturnTypeNodeOrThrow().getText(),
		"prismic.Client",
	);
});

test("includes @prismicio/client Content namespace containing all document and Slice types if configured", (t) => {
	const res = lib.generateTypes({
		clientIntegration: {
			includeContentNamespace: true,
		},
		customTypeModels: [prismicM.model.customType({ seed: t.title, id: "foo" })],
		sharedSliceModels: [
			prismicM.model.sharedSlice({
				seed: t.title,
				id: "bar",
				variations: [
					prismicM.model.sharedSliceVariation({ seed: t.title, id: "baz" }),
				],
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

	t.true(exportSymbolNames.includes("FooDocument"));
	t.true(exportSymbolNames.includes("AllDocumentTypes"));
	t.true(exportSymbolNames.includes("BarSlice"));
});

test("includes empty @prismicio/client Content namespace if configured and no models are provided", (t) => {
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

	t.is(exportSymbolNames.length, 0);
});
