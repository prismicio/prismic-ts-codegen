import test from "ava";

import { parseSourceFile } from "./__testutils__/parseSourceFile";

import * as lib from "../src";

test("generates a Custom Type type", (t) => {
	const res = lib.generateTypes({
		customTypeModels: [
			{
				id: "foo",
				label: "Foo",
				status: true,
				repeatable: true,
				json: {
					Main: {
						foo: {
							type: "Text",
							config: {
								label: "Foo",
							},
						},
					},
				},
			},
		],
	});

	const file = parseSourceFile(res);
	const typeAlias = file.getTypeAliasOrThrow("FooDocument");

	t.true(typeAlias.isExported());

	const langTypeParameter = typeAlias.getTypeParameterOrThrow("Lang");
	t.is(
		langTypeParameter.getConstraintOrThrow().getText(),
		"string",
		'Lang type parameter must extend "string"',
	);
	t.is(
		langTypeParameter.getDefaultOrThrow().getText(),
		"string",
		'Lang type parameter default is "string"',
	);

	const type = typeAlias.getTypeNodeOrThrow();
	t.is(
		type.getText(),
		'prismicT.PrismicDocumentWithoutUID<FooDocumentData, "foo", Lang>',
	);

	t.notThrows(() => {
		file.getInterfaceOrThrow("FooDocumentData");
	}, "contains a FooDocumentData interface");
});

test("uses PrismicDocumentWithUID when model contains a UID field", (t) => {
	const res = lib.generateTypes({
		customTypeModels: [
			{
				id: "foo",
				label: "Foo",
				status: true,
				repeatable: true,
				json: {
					Main: {
						uid: {
							type: "UID",
							config: {
								label: "UID",
							},
						},
					},
				},
			},
		],
	});

	const file = parseSourceFile(res);
	const type = file.getTypeAliasOrThrow("FooDocument").getTypeNodeOrThrow();

	t.regex(type.getText(), /^prismicT.PrismicDocumentWithUID</);
});

test("data interface contains data fields", (t) => {
	const res = lib.generateTypes({
		customTypeModels: [
			{
				id: "foo",
				label: "Foo",
				status: true,
				repeatable: true,
				json: {
					Main: {
						keyText: {
							type: "Text",
							config: {
								label: "KeyText",
							},
						},
					},
				},
			},
		],
	});

	const file = parseSourceFile(res);
	const dataTypeAlias = file.getInterfaceOrThrow("FooDocumentData");

	t.false(dataTypeAlias.isExported());

	t.notThrows(() => {
		dataTypeAlias.getPropertyOrThrow("keyText");
	});
});

test("data interface is empty record type alias if no data fields are defined", (t) => {
	const res = lib.generateTypes({
		customTypeModels: [
			{
				id: "no_fields",
				label: "No Fields",
				status: true,
				repeatable: true,
				json: {
					Main: {},
				},
			},
			{
				id: "only_uid",
				label: "Only UID",
				status: true,
				repeatable: true,
				json: {
					Main: {
						uid: {
							type: "UID",
							config: {
								label: "UID",
							},
						},
					},
				},
			},
		],
	});

	const file = parseSourceFile(res);

	t.is(
		file
			.getTypeAliasOrThrow("NoFieldsDocumentData")
			.getTypeNodeOrThrow()
			.getText(),
		"Record<string, never>",
	);

	t.is(
		file
			.getTypeAliasOrThrow("OnlyUidDocumentData")
			.getTypeNodeOrThrow()
			.getText(),
		"Record<string, never>",
	);
});

test("includes specific lang IDs if given", (t) => {
	const res = lib.generateTypes({
		customTypeModels: [
			{
				id: "foo",
				label: "Foo",
				status: true,
				repeatable: true,
				json: {
					Main: {},
				},
			},
		],
		langIDs: ["en-us", "fr-fr"],
	});

	const file = parseSourceFile(res);
	const langDefault = file
		.getTypeAliasOrThrow("FooDocument")
		.getTypeParameterOrThrow("Lang")
		.getDefaultOrThrow()
		.getText();

	t.is(langDefault, '"en-us" | "fr-fr"');
});
