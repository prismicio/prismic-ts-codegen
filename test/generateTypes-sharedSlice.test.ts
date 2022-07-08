import test from "ava";
import * as prismicM from "@prismicio/mock";

import { parseSourceFile } from "./__testutils__/parseSourceFile";

import * as lib from "../src";

test("correctly typed", (t) => {
	const mock = prismicM.createMockFactory({ seed: t.title });

	const model = mock.model.sharedSlice({
		id: "foo",
		variations: [
			mock.model.sharedSliceVariation({
				id: "bar",
				primaryFields: {
					abc: mock.model.keyText(),
				},
				itemsFields: {
					def: mock.model.select(),
				},
			}),
			mock.model.sharedSliceVariation({
				id: "baz",
				primaryFields: {
					ghi: mock.model.keyText(),
				},
				itemsFields: {
					jkl: mock.model.select(),
				},
			}),
		],
	});

	const types = lib.generateTypes({ sharedSliceModels: [model] });
	const file = parseSourceFile(types);
	const sliceTypeAlias = file.getTypeAliasOrThrow("FooSlice");

	t.true(sliceTypeAlias.isExported());

	t.is(
		sliceTypeAlias.getTypeNodeOrThrow().getText(),
		'prismicT.SharedSlice<"foo", FooSliceVariation>',
	);
});

test("creates a type alias to a union of all Slice variation types", (t) => {
	const mock = prismicM.createMockFactory({ seed: t.title });

	const model = mock.model.sharedSlice({
		id: "foo",
		variations: [
			mock.model.sharedSliceVariation({
				id: "bar",
				primaryFields: {
					abc: mock.model.keyText(),
				},
				itemsFields: {
					def: mock.model.select(),
				},
			}),
			mock.model.sharedSliceVariation({
				id: "baz",
				primaryFields: {
					ghi: mock.model.keyText(),
				},
				itemsFields: {
					jkl: mock.model.select(),
				},
			}),
		],
	});

	const types = lib.generateTypes({ sharedSliceModels: [model] });
	const file = parseSourceFile(types);
	const sliceTypeAlias = file.getTypeAliasOrThrow("FooSliceVariation");

	t.is(
		sliceTypeAlias.getTypeNodeOrThrow().getText(),
		"FooSliceBar | FooSliceBaz",
	);
});

test("creates a type alias for each Slice variation", (t) => {
	const mock = prismicM.createMockFactory({ seed: t.title });

	const model = mock.model.sharedSlice({
		id: "foo",
		variations: [
			mock.model.sharedSliceVariation({
				id: "bar",
				primaryFields: {
					abc: mock.model.keyText(),
				},
				itemsFields: {
					def: mock.model.select(),
				},
			}),
			mock.model.sharedSliceVariation({
				id: "baz",
				primaryFields: {
					ghi: mock.model.keyText(),
				},
				itemsFields: {
					jkl: mock.model.select(),
				},
			}),
		],
	});

	const types = lib.generateTypes({ sharedSliceModels: [model] });
	const file = parseSourceFile(types);

	const barType = file.getTypeAliasOrThrow("FooSliceBar");
	const bazType = file.getTypeAliasOrThrow("FooSliceBaz");

	t.true(barType.isExported());
	t.true(bazType.isExported());

	t.is(
		barType.getTypeNodeOrThrow().getText(),
		'prismicT.SharedSliceVariation<"bar", Simplify<FooSliceBarPrimary>, Simplify<FooSliceBarItem>>',
	);

	t.is(
		bazType.getTypeNodeOrThrow().getText(),
		'prismicT.SharedSliceVariation<"baz", Simplify<FooSliceBazPrimary>, Simplify<FooSliceBazItem>>',
	);
});

test("handles Slice variations with no fields", (t) => {
	const mock = prismicM.createMockFactory({ seed: t.title });

	const model = mock.model.sharedSlice({
		id: "foo",
		variations: [mock.model.sharedSliceVariation({ id: "bar" })],
	});

	const types = lib.generateTypes({ sharedSliceModels: [model] });
	const file = parseSourceFile(types);

	t.is(
		file.getTypeAliasOrThrow("FooSliceBar").getTypeNodeOrThrow().getText(),
		'prismicT.SharedSliceVariation<"bar", Record<string, never>, never>',
	);
});

test("handles Slice variations with no primary fields", (t) => {
	const mock = prismicM.createMockFactory({ seed: t.title });

	const model = mock.model.sharedSlice({
		id: "foo",
		variations: [
			mock.model.sharedSliceVariation({
				id: "bar",
				itemsFields: {
					def: mock.model.select(),
				},
			}),
		],
	});

	const types = lib.generateTypes({ sharedSliceModels: [model] });
	const file = parseSourceFile(types);

	t.is(
		file.getTypeAliasOrThrow("FooSliceBar").getTypeNodeOrThrow().getText(),
		'prismicT.SharedSliceVariation<"bar", Record<string, never>, Simplify<FooSliceBarItem>>',
	);
});

test("handles Slice variations with no item fields", (t) => {
	const mock = prismicM.createMockFactory({ seed: t.title });

	const model = mock.model.sharedSlice({
		id: "foo",
		variations: [
			mock.model.sharedSliceVariation({
				id: "bar",
				primaryFields: {
					abc: mock.model.keyText(),
				},
			}),
		],
	});

	const types = lib.generateTypes({ sharedSliceModels: [model] });
	const file = parseSourceFile(types);

	t.is(
		file.getTypeAliasOrThrow("FooSliceBar").getTypeNodeOrThrow().getText(),
		'prismicT.SharedSliceVariation<"bar", Simplify<FooSliceBarPrimary>, never>',
	);
});

test("creates an interface for a Slice variation's primary fields", (t) => {
	const mock = prismicM.createMockFactory({ seed: t.title });

	const model = mock.model.sharedSlice({
		id: "foo",
		variations: [
			mock.model.sharedSliceVariation({
				id: "bar",
				primaryFields: {
					abc: mock.model.keyText(),
				},
				itemsFields: {
					def: mock.model.select(),
				},
			}),
		],
	});

	const types = lib.generateTypes({ sharedSliceModels: [model] });
	const file = parseSourceFile(types);

	const primaryInterface = file.getInterfaceOrThrow("FooSliceBarPrimary");
	t.is(
		primaryInterface.getPropertyOrThrow("abc").getTypeNodeOrThrow().getText(),
		"prismicT.KeyTextField",
	);
});

test("creates an interface for a Slice variation's items fields", (t) => {
	const mock = prismicM.createMockFactory({ seed: t.title });

	const model = mock.model.sharedSlice({
		id: "foo",
		variations: [
			mock.model.sharedSliceVariation({
				id: "bar",
				primaryFields: {
					abc: mock.model.keyText(),
				},
				itemsFields: {
					def: mock.model.select(),
				},
			}),
		],
	});

	const types = lib.generateTypes({ sharedSliceModels: [model] });
	const file = parseSourceFile(types);

	const itemInterface = file.getInterfaceOrThrow("FooSliceBarItem");

	t.true(itemInterface.isExported());

	t.is(
		itemInterface.getPropertyOrThrow("def").getTypeNodeOrThrow().getText(),
		"prismicT.SelectField",
	);
});

test("handles Shared Slice with no variations", (t) => {
	const model = prismicM.model.sharedSlice({
		seed: t.title,
		id: "foo",
		variations: [],
	});

	const types = lib.generateTypes({ sharedSliceModels: [model] });
	const file = parseSourceFile(types);

	t.is(
		file.getTypeAliasOrThrow("FooSlice").getTypeNodeOrThrow().getText(),
		'prismicT.SharedSlice<"foo", FooSliceVariation>',
	);

	t.is(
		file
			.getTypeAliasOrThrow("FooSliceVariation")
			.getTypeNodeOrThrow()
			.getText(),
		"never",
	);
});

test("handles hyphenated fields", (t) => {
	const mock = prismicM.createMockFactory({ seed: t.title });

	const model = mock.model.sharedSlice({
		id: "foo",
		variations: [
			mock.model.sharedSliceVariation({
				id: "bar",
				primaryFields: {
					"hyphenated-field": mock.model.keyText(),
				},
				itemsFields: {
					"hyphenated-field": mock.model.select(),
				},
			}),
		],
	});

	const types = lib.generateTypes({ sharedSliceModels: [model] });
	const file = parseSourceFile(types);

	const primaryInterface = file.getInterfaceOrThrow("FooSliceBarPrimary");
	const itemInterface = file.getInterfaceOrThrow("FooSliceBarItem");

	t.is(
		primaryInterface
			.getPropertyOrThrow('"hyphenated-field"')
			.getTypeNodeOrThrow()
			.getText(),
		"prismicT.KeyTextField",
	);

	t.is(
		itemInterface
			.getPropertyOrThrow('"hyphenated-field"')
			.getTypeNodeOrThrow()
			.getText(),
		"prismicT.SelectField",
	);
});
