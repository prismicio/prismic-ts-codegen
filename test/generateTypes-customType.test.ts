import test from "ava";
import * as prismicM from "@prismicio/mock";

import { parseSourceFile } from "./__testutils__/parseSourceFile";

import * as lib from "../src";

test("generates a Custom Type type", (t) => {
	const mock = prismicM.createMockFactory({ seed: t.title });

	const res = lib.generateTypes({
		customTypeModels: [
			mock.model.customType({
				id: "foo",
				fields: {
					bar: mock.model.keyText(),
				},
			}),
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
		'prismicT.PrismicDocumentWithoutUID<Simplify<FooDocumentData>, "foo", Lang>',
	);

	t.notThrows(() => {
		file.getInterfaceOrThrow("FooDocumentData");
	}, "contains a FooDocumentData interface");
});

test("uses PrismicDocumentWithUID when model contains a UID field", (t) => {
	const mock = prismicM.createMockFactory({ seed: t.title });

	const res = lib.generateTypes({
		customTypeModels: [
			mock.model.customType({
				id: "foo",
				fields: {
					uid: mock.model.uid(),
				},
			}),
		],
	});

	const file = parseSourceFile(res);
	const type = file.getTypeAliasOrThrow("FooDocument").getTypeNodeOrThrow();
	t.is(
		type.getText(),
		'prismicT.PrismicDocumentWithUID<Simplify<FooDocumentData>, "foo", Lang>',
	);
});

test("data interface contains data fields", (t) => {
	const mock = prismicM.createMockFactory({ seed: t.title });

	const res = lib.generateTypes({
		customTypeModels: [
			mock.model.customType({
				id: "foo",
				fields: {
					bar: mock.model.keyText(),
				},
			}),
		],
	});

	const file = parseSourceFile(res);
	const dataTypeAlias = file.getInterfaceOrThrow("FooDocumentData");

	t.false(dataTypeAlias.isExported());

	t.notThrows(() => {
		dataTypeAlias.getPropertyOrThrow("bar");
	});
});

test("data interface is empty record type alias if no data fields are defined", (t) => {
	const mock = prismicM.createMockFactory({ seed: t.title });

	const res = lib.generateTypes({
		customTypeModels: [
			mock.model.customType({
				id: "no_fields",
				fields: {},
			}),
			mock.model.customType({
				id: "only_uid",
				fields: {
					uid: mock.model.uid(),
				},
			}),
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
			prismicM.model.customType({
				seed: t.title,
				id: "foo",
			}),
		],
		localeIDs: ["en-us", "fr-fr"],
	});

	const file = parseSourceFile(res);
	const langDefault = file
		.getTypeAliasOrThrow("FooDocument")
		.getTypeParameterOrThrow("Lang")
		.getDefaultOrThrow()
		.getText();

	t.is(langDefault, '"en-us" | "fr-fr"');
});

test("handles hyphenated fields", (t) => {
	const res = lib.generateTypes({
		customTypeModels: [
			prismicM.model.customType({
				seed: t.title,
				id: "foo",
				fields: {
					"hyphenated-field": prismicM.model.keyText({ seed: t.title }),
				},
			}),
		],
	});

	const file = parseSourceFile(res);
	const dataInterface = file.getInterfaceOrThrow("FooDocumentData");

	t.is(
		dataInterface
			.getPropertyOrThrow('"hyphenated-field"')
			.getTypeNodeOrThrow()
			.getText(),
		"prismicT.KeyTextField",
	);
});
