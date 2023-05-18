import { expect, it } from "vitest";

import { parseSourceFile } from "./__testutils__/parseSourceFile";

import * as lib from "../src";

it("generates a Custom Type type", (ctx) => {
	const res = lib.generateTypes({
		customTypeModels: [
			ctx.mock.model.customType({
				id: "foo",
				fields: {
					bar: ctx.mock.model.keyText(),
				},
			}),
		],
	});

	const file = parseSourceFile(res);
	const typeAlias = file.getTypeAliasOrThrow("FooDocument");

	expect(typeAlias.isExported()).toBe(true);

	const langTypeParameter = typeAlias.getTypeParameterOrThrow("Lang");
	expect(
		langTypeParameter.getConstraintOrThrow().getText(),
		'Lang type parameter must extend "string"',
	).toBe("string");

	const type = typeAlias.getTypeNodeOrThrow();
	expect(type.getText()).toBe(
		'prismicT.PrismicDocumentWithoutUID<Simplify<FooDocumentData>, "foo", Lang>',
	);

	expect(() => {
		file.getInterfaceOrThrow("FooDocumentData");
	}).not.throws("contains a FooDocumentData interface");
});

it("uses PrismicDocumentWithUID when model contains a UID field", (ctx) => {
	const res = lib.generateTypes({
		customTypeModels: [
			ctx.mock.model.customType({
				id: "foo",
				fields: {
					uid: ctx.mock.model.uid(),
				},
			}),
		],
	});

	const file = parseSourceFile(res);
	const type = file.getTypeAliasOrThrow("FooDocument").getTypeNodeOrThrow();
	expect(type.getText()).toBe(
		'prismicT.PrismicDocumentWithUID<Simplify<FooDocumentData>, "foo", Lang>',
	);
});

it("data interface contains data fields", (ctx) => {
	const res = lib.generateTypes({
		customTypeModels: [
			ctx.mock.model.customType({
				id: "foo",
				fields: {
					bar: ctx.mock.model.keyText(),
				},
			}),
		],
	});

	const file = parseSourceFile(res);
	const dataTypeAlias = file.getInterfaceOrThrow("FooDocumentData");

	expect(dataTypeAlias.isExported()).toBe(false);

	expect(() => {
		dataTypeAlias.getPropertyOrThrow("bar");
	}).not.throws();
});

it("data interface is empty record type alias if no data fields are defined", (ctx) => {
	const res = lib.generateTypes({
		customTypeModels: [
			ctx.mock.model.customType({
				id: "no_fields",
				fields: {},
			}),
			ctx.mock.model.customType({
				id: "only_uid",
				fields: {
					uid: ctx.mock.model.uid(),
				},
			}),
		],
	});

	const file = parseSourceFile(res);

	expect(
		file
			.getTypeAliasOrThrow("NoFieldsDocumentData")
			.getTypeNodeOrThrow()
			.getText(),
	).toBe("Record<string, never>");

	expect(
		file
			.getTypeAliasOrThrow("OnlyUidDocumentData")
			.getTypeNodeOrThrow()
			.getText(),
	).toBe("Record<string, never>");
});

it("includes specific lang IDs if given", (ctx) => {
	const res = lib.generateTypes({
		customTypeModels: [ctx.mock.model.customType({ id: "foo" })],
		localeIDs: ["en-us", "fr-fr"],
	});

	const file = parseSourceFile(res);
	const langDefault = file
		.getTypeAliasOrThrow("FooDocument")
		.getTypeParameterOrThrow("Lang")
		.getDefaultOrThrow()
		.getText();

	expect(langDefault).toBe('"en-us" | "fr-fr"');
});

it("handles hyphenated fields", (ctx) => {
	const res = lib.generateTypes({
		customTypeModels: [
			ctx.mock.model.customType({
				id: "foo",
				fields: {
					"hyphenated-field": ctx.mock.model.keyText(),
				},
			}),
		],
	});

	const file = parseSourceFile(res);
	const dataInterface = file.getInterfaceOrThrow("FooDocumentData");

	expect(
		dataInterface
			.getPropertyOrThrow('"hyphenated-field"')
			.getTypeNodeOrThrow()
			.getText(),
	).toBe("prismicT.KeyTextField");
});

it("handles fields starting with a number", (ctx) => {
	const res = lib.generateTypes({
		customTypeModels: [
			ctx.mock.model.customType({
				id: "foo",
				fields: {
					"3d_noodle": ctx.mock.model.keyText(),
				},
			}),
		],
	});

	const file = parseSourceFile(res);
	const dataInterface = file.getInterfaceOrThrow("FooDocumentData");

	expect(
		dataInterface
			.getPropertyOrThrow('"3d_noodle"')
			.getTypeNodeOrThrow()
			.getText(),
	).toBe("prismicT.KeyTextField");
});

it("prefixes types starting with a number with an underscore", (ctx) => {
	const res = lib.generateTypes({
		customTypeModels: [ctx.mock.model.customType({ id: "404" })],
	});

	const file = parseSourceFile(res);

	expect(() => {
		file.getTypeAliasOrThrow("_404Document");
	}).not.throws("contains a _404Document type alias");

	expect(() => {
		file.getTypeAliasOrThrow("_404DocumentData");
	}).not.throws("contains a _404DocumentData type alias");
});
