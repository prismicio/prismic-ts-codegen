import { expect, it } from "vitest";

import { parseSourceFile } from "./__testutils__/parseSourceFile";

import * as lib from "../src";

it("correctly typed", (ctx) => {
	const model = ctx.mock.model.sharedSlice({
		id: "foo",
		variations: [
			ctx.mock.model.sharedSliceVariation({
				id: "bar",
				primaryFields: {
					abc: ctx.mock.model.keyText(),
				},
				itemsFields: {
					def: ctx.mock.model.select(),
				},
			}),
			ctx.mock.model.sharedSliceVariation({
				id: "baz",
				primaryFields: {
					ghi: ctx.mock.model.keyText(),
				},
				itemsFields: {
					jkl: ctx.mock.model.select(),
				},
			}),
		],
	});

	const types = lib.generateTypes({ sharedSliceModels: [model] });
	const file = parseSourceFile(types);
	const sliceTypeAlias = file.getTypeAliasOrThrow("FooSlice");

	expect(sliceTypeAlias.isExported()).toBe(true);

	expect(sliceTypeAlias.getTypeNodeOrThrow().getText()).toBe(
		'prismic.SharedSlice<"foo", FooSliceVariation>',
	);
});

it("creates a type alias to a union of all Slice variation types", (ctx) => {
	const model = ctx.mock.model.sharedSlice({
		id: "foo",
		variations: [
			ctx.mock.model.sharedSliceVariation({
				id: "bar",
				primaryFields: {
					abc: ctx.mock.model.keyText(),
				},
				itemsFields: {
					def: ctx.mock.model.select(),
				},
			}),
			ctx.mock.model.sharedSliceVariation({
				id: "baz",
				primaryFields: {
					ghi: ctx.mock.model.keyText(),
				},
				itemsFields: {
					jkl: ctx.mock.model.select(),
				},
			}),
		],
	});

	const types = lib.generateTypes({ sharedSliceModels: [model] });
	const file = parseSourceFile(types);
	const sliceTypeAlias = file.getTypeAliasOrThrow("FooSliceVariation");

	expect(sliceTypeAlias.getTypeNodeOrThrow().getText()).toBe(
		"FooSliceBar | FooSliceBaz",
	);
});

it("creates a type alias for each Slice variation", (ctx) => {
	const model = ctx.mock.model.sharedSlice({
		id: "foo",
		variations: [
			ctx.mock.model.sharedSliceVariation({
				id: "bar",
				primaryFields: {
					abc: ctx.mock.model.keyText(),
				},
				itemsFields: {
					def: ctx.mock.model.select(),
				},
			}),
			ctx.mock.model.sharedSliceVariation({
				id: "baz",
				primaryFields: {
					ghi: ctx.mock.model.keyText(),
				},
				itemsFields: {
					jkl: ctx.mock.model.select(),
				},
			}),
		],
	});

	const types = lib.generateTypes({ sharedSliceModels: [model] });
	const file = parseSourceFile(types);

	const barType = file.getTypeAliasOrThrow("FooSliceBar");
	const bazType = file.getTypeAliasOrThrow("FooSliceBaz");

	expect(barType.isExported()).toBe(true);
	expect(bazType.isExported()).toBe(true);

	expect(barType.getTypeNodeOrThrow().getText()).toBe(
		'prismic.SharedSliceVariation<"bar", Simplify<FooSliceBarPrimary>, Simplify<FooSliceBarItem>>',
	);

	expect(bazType.getTypeNodeOrThrow().getText()).toBe(
		'prismic.SharedSliceVariation<"baz", Simplify<FooSliceBazPrimary>, Simplify<FooSliceBazItem>>',
	);
});

it("handles Slice variations with no fields", (ctx) => {
	const model = ctx.mock.model.sharedSlice({
		id: "foo",
		variations: [ctx.mock.model.sharedSliceVariation({ id: "bar" })],
	});

	const types = lib.generateTypes({ sharedSliceModels: [model] });
	const file = parseSourceFile(types);

	expect(
		file.getTypeAliasOrThrow("FooSliceBar").getTypeNodeOrThrow().getText(),
	).toBe('prismic.SharedSliceVariation<"bar", Record<string, never>, never>');
});

it("handles Slice variations with no primary fields", (ctx) => {
	const model = ctx.mock.model.sharedSlice({
		id: "foo",
		variations: [
			ctx.mock.model.sharedSliceVariation({
				id: "bar",
				itemsFields: {
					def: ctx.mock.model.select(),
				},
			}),
		],
	});

	const types = lib.generateTypes({ sharedSliceModels: [model] });
	const file = parseSourceFile(types);

	expect(
		file.getTypeAliasOrThrow("FooSliceBar").getTypeNodeOrThrow().getText(),
	).toBe(
		'prismic.SharedSliceVariation<"bar", Record<string, never>, Simplify<FooSliceBarItem>>',
	);
});

it("handles Slice variations with no item fields", (ctx) => {
	const model = ctx.mock.model.sharedSlice({
		id: "foo",
		variations: [
			ctx.mock.model.sharedSliceVariation({
				id: "bar",
				primaryFields: {
					abc: ctx.mock.model.keyText(),
				},
			}),
		],
	});

	const types = lib.generateTypes({ sharedSliceModels: [model] });
	const file = parseSourceFile(types);

	expect(
		file.getTypeAliasOrThrow("FooSliceBar").getTypeNodeOrThrow().getText(),
	).toBe(
		'prismic.SharedSliceVariation<"bar", Simplify<FooSliceBarPrimary>, never>',
	);
});

it("creates an interface for a Slice variation's primary fields", (ctx) => {
	const model = ctx.mock.model.sharedSlice({
		id: "foo",
		variations: [
			ctx.mock.model.sharedSliceVariation({
				id: "bar",
				primaryFields: {
					abc: ctx.mock.model.keyText(),
				},
				itemsFields: {
					def: ctx.mock.model.select(),
				},
			}),
		],
	});

	const types = lib.generateTypes({ sharedSliceModels: [model] });
	const file = parseSourceFile(types);

	const primaryInterface = file.getInterfaceOrThrow("FooSliceBarPrimary");
	expect(
		primaryInterface.getPropertyOrThrow("abc").getTypeNodeOrThrow().getText(),
	).toBe("prismic.KeyTextField");
});

it("creates an interface for a Slice variation's items fields", (ctx) => {
	const model = ctx.mock.model.sharedSlice({
		id: "foo",
		variations: [
			ctx.mock.model.sharedSliceVariation({
				id: "bar",
				primaryFields: {
					abc: ctx.mock.model.keyText(),
				},
				itemsFields: {
					def: ctx.mock.model.select(),
				},
			}),
		],
	});

	const types = lib.generateTypes({ sharedSliceModels: [model] });
	const file = parseSourceFile(types);

	const itemInterface = file.getInterfaceOrThrow("FooSliceBarItem");

	expect(itemInterface.isExported()).toBe(true);

	expect(
		itemInterface.getPropertyOrThrow("def").getTypeNodeOrThrow().getText(),
	).toBe("prismic.SelectField");
});

it("handles Shared Slice with no variations", (ctx) => {
	const model = ctx.mock.model.sharedSlice({
		id: "foo",
		variations: [],
	});

	const types = lib.generateTypes({ sharedSliceModels: [model] });
	const file = parseSourceFile(types);

	expect(
		file.getTypeAliasOrThrow("FooSlice").getTypeNodeOrThrow().getText(),
	).toBe('prismic.SharedSlice<"foo", FooSliceVariation>');

	expect(
		file
			.getTypeAliasOrThrow("FooSliceVariation")
			.getTypeNodeOrThrow()
			.getText(),
	).toBe("never");
});

it("handles hyphenated fields", (ctx) => {
	const model = ctx.mock.model.sharedSlice({
		id: "foo",
		variations: [
			ctx.mock.model.sharedSliceVariation({
				id: "bar",
				primaryFields: {
					"hyphenated-field": ctx.mock.model.keyText(),
				},
				itemsFields: {
					"hyphenated-field": ctx.mock.model.select(),
				},
			}),
		],
	});

	const types = lib.generateTypes({ sharedSliceModels: [model] });
	const file = parseSourceFile(types);

	const primaryInterface = file.getInterfaceOrThrow("FooSliceBarPrimary");
	const itemInterface = file.getInterfaceOrThrow("FooSliceBarItem");

	expect(
		primaryInterface
			.getPropertyOrThrow('"hyphenated-field"')
			.getTypeNodeOrThrow()
			.getText(),
	).toBe("prismic.KeyTextField");

	expect(
		itemInterface
			.getPropertyOrThrow('"hyphenated-field"')
			.getTypeNodeOrThrow()
			.getText(),
	).toBe("prismic.SelectField");
});

it("prefixes types starting with a number with an underscore", (ctx) => {
	const model = ctx.mock.model.sharedSlice({
		id: "123",
		variations: [
			ctx.mock.model.sharedSliceVariation({
				id: "456",
				primaryFields: {
					foo: ctx.mock.model.keyText(),
				},
			}),
			ctx.mock.model.sharedSliceVariation({
				id: "789",
				primaryFields: {
					bar: ctx.mock.model.keyText(),
				},
			}),
		],
	});

	const types = lib.generateTypes({ sharedSliceModels: [model] });
	const file = parseSourceFile(types);

	const sliceTypeAlias = file.getTypeAliasOrThrow("_123Slice");
	const sliceVariationTypeAlias =
		file.getTypeAliasOrThrow("_123SliceVariation");

	expect(sliceTypeAlias.getTypeNodeOrThrow().getText()).toBe(
		'prismic.SharedSlice<"123", _123SliceVariation>',
	);

	expect(sliceVariationTypeAlias.getTypeNodeOrThrow().getText()).toBe(
		"_123Slice456 | _123Slice789",
	);
});
