import { expect, it } from "vitest";

import { expectToHaveDocs } from "./__testutils__/expectToHaveDocs";
import { parseSourceFile } from "./__testutils__/parseSourceFile";

import * as lib from "../src";

it("correctly typed", (ctx) => {
	const model = ctx.mock.model.customType({
		id: "foo",
		fields: {
			bar: ctx.mock.model.group({
				fields: {
					baz: ctx.mock.model.keyText(),
					qux: ctx.mock.model.select(),
				},
			}),
		},
	});

	const types = lib.generateTypes({ customTypeModels: [model] });
	const file = parseSourceFile(types);
	const groupProperty = file
		.getInterfaceOrThrow("FooDocumentData")
		.getPropertyOrThrow("bar");

	expect(groupProperty.getTypeNodeOrThrow().getText()).toBe(
		"prismic.GroupField<Simplify<FooDocumentDataBarItem>>",
	);
});

it("creates an interface for a group item containing its fields", (ctx) => {
	const model = ctx.mock.model.customType({
		id: "foo",
		fields: {
			bar: ctx.mock.model.group({
				fields: {
					baz: ctx.mock.model.keyText(),
					qux: ctx.mock.model.select(),
				},
			}),
		},
	});

	const types = lib.generateTypes({ customTypeModels: [model] });
	const file = parseSourceFile(types);
	const itemInterface = file.getInterfaceOrThrow("FooDocumentDataBarItem");

	expect(itemInterface.isExported()).toBe(true);

	expect(
		itemInterface.getPropertyOrThrow("baz").getTypeNodeOrThrow().getText(),
	).toBe("prismic.KeyTextField");
	expect(
		itemInterface.getPropertyOrThrow("qux").getTypeNodeOrThrow().getText(),
	).toBe("prismic.SelectField");
});

it("supports nested groups", (ctx) => {
	const model = ctx.mock.model.customType({
		id: "foo",
		fields: {
			bar: ctx.mock.model.group({
				fields: {
					baz: ctx.mock.model.group({
						fields: {
							qux: ctx.mock.model.keyText(),
							quux: ctx.mock.model.select(),
						},
					}),
				},
			}),
		},
	});

	const types = lib.generateTypes({ customTypeModels: [model] });
	const file = parseSourceFile(types);

	const nestedGroupProperty = file
		.getInterfaceOrThrow("FooDocumentDataBarItem")
		.getPropertyOrThrow("baz");
	expect(nestedGroupProperty.getTypeNodeOrThrow().getText()).toBe(
		"prismic.NestedGroupField<Simplify<FooDocumentDataBarBazItem>>",
	);

	const nestedGroupItemInterface = file.getInterfaceOrThrow(
		"FooDocumentDataBarBazItem",
	);
	expect(nestedGroupItemInterface.isExported()).toBe(true);
	expect(
		nestedGroupItemInterface
			.getPropertyOrThrow("qux")
			.getTypeNodeOrThrow()
			.getText(),
	).toBe("prismic.KeyTextField");
	expect(
		nestedGroupItemInterface
			.getPropertyOrThrow("quux")
			.getTypeNodeOrThrow()
			.getText(),
	).toBe("prismic.SelectField");
});

it("prefixes Group types starting with a number using an underscore prefix", (ctx) => {
	const model = ctx.mock.model.customType({
		id: "123",
		fields: {
			456: ctx.mock.model.group({
				fields: {
					bar: ctx.mock.model.keyText(),
				},
			}),
		},
	});

	const types = lib.generateTypes({ customTypeModels: [model] });
	const file = parseSourceFile(types);

	const groupProperty = file
		.getInterfaceOrThrow("_123DocumentData")
		.getPropertyOrThrow('"456"');

	expect(groupProperty.getTypeNodeOrThrow().getText()).toBe(
		"prismic.GroupField<Simplify<_123DocumentData456Item>>",
	);
});

it("handles hyphenated fields", (ctx) => {
	const model = ctx.mock.model.customType({
		id: "foo",
		fields: {
			bar: ctx.mock.model.group({
				fields: {
					"hyphenated-field": ctx.mock.model.keyText(),
				},
			}),
		},
	});

	const types = lib.generateTypes({ customTypeModels: [model] });
	const file = parseSourceFile(types);
	const itemInterface = file.getInterfaceOrThrow("FooDocumentDataBarItem");

	expect(
		itemInterface
			.getPropertyOrThrow('"hyphenated-field"')
			.getTypeNodeOrThrow()
			.getText(),
	).toBe("prismic.KeyTextField");
});

it.todo("is correctly documented", (ctx) => {
	// TODO
	expectToHaveDocs(ctx.mock.model.boolean());
});
