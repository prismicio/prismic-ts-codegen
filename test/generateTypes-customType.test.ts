import test from "ava";
import * as prismicM from "@prismicio/mock";

import { parseSourceFile } from "./__testutils__/parseSourceFile";

import * as lib from "../src";

test("generates a Custom Type type", (t) => {
	const res = lib.generateTypes({
		customTypeModels: [
			prismicM.model.customType({
				seed: t.title,
				id: "foo",
				fields: {
					bar: prismicM.model.keyText({ seed: t.title }),
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
		'prismicT.PrismicDocumentWithoutUID<FooDocumentData, "foo", Lang>',
	);

	t.notThrows(() => {
		file.getInterfaceOrThrow("FooDocumentData");
	}, "contains a FooDocumentData interface");
});

test("uses PrismicDocumentWithUID when model contains a UID field", (t) => {
	const res = lib.generateTypes({
		customTypeModels: [
			prismicM.model.customType({
				seed: t.title,
				id: "foo",
				fields: {
					uid: prismicM.model.uid({ seed: t.title }),
				},
			}),
		],
	});

	const file = parseSourceFile(res);
	const type = file.getTypeAliasOrThrow("FooDocument").getTypeNodeOrThrow();

	t.regex(type.getText(), /^prismicT.PrismicDocumentWithUID</);
});

test("data interface contains data fields", (t) => {
	const res = lib.generateTypes({
		customTypeModels: [
			prismicM.model.customType({
				seed: t.title,
				id: "foo",
				fields: {
					bar: prismicM.model.keyText({ seed: t.title }),
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
	const res = lib.generateTypes({
		customTypeModels: [
			prismicM.model.customType({
				seed: t.title,
				id: "no_fields",
				fields: {},
			}),
			prismicM.model.customType({
				seed: t.title,
				id: "only_uid",
				fields: {
					uid: prismicM.model.uid({ seed: t.title }),
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
