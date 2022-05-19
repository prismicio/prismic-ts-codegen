import test from "ava";
import * as prismicM from "@prismicio/mock";

import { parseSourceFile } from "./__testutils__/parseSourceFile";

import * as lib from "../src";

test("correctly typed", (t) => {
	const model = prismicM.model.sharedSlice({
		seed: t.title,
		id: "foo",
		variations: [
			prismicM.model.sharedSliceVariation({
				seed: t.title,
				id: "bar",
				primaryFields: {
					abc: prismicM.model.keyText({ seed: t.title }),
				},
				itemsFields: {
					def: prismicM.model.select({ seed: t.title }),
				},
			}),
			prismicM.model.sharedSliceVariation({
				seed: t.title,
				id: "baz",
				primaryFields: {
					ghi: prismicM.model.keyText({ seed: t.title }),
				},
				itemsFields: {
					jkl: prismicM.model.select({ seed: t.title }),
				},
			}),
		],
	});

	const types = lib.generateTypes({ sharedSliceModels: [model] });
	const file = parseSourceFile(types);
	const sliceTypeAlias = file.getTypeAliasOrThrow("FooSlice");

	t.is(
		sliceTypeAlias.getTypeNodeOrThrow().getText(),
		'prismicT.SharedSlice<"foo", FooSliceVariation>',
	);
});

test("creates a type alias to a union of all Slice variation types", (t) => {
	const model = prismicM.model.sharedSlice({
		seed: t.title,
		id: "foo",
		variations: [
			prismicM.model.sharedSliceVariation({
				seed: t.title,
				id: "bar",
				primaryFields: {
					abc: prismicM.model.keyText({ seed: t.title }),
				},
				itemsFields: {
					def: prismicM.model.select({ seed: t.title }),
				},
			}),
			prismicM.model.sharedSliceVariation({
				seed: t.title,
				id: "baz",
				primaryFields: {
					ghi: prismicM.model.keyText({ seed: t.title }),
				},
				itemsFields: {
					jkl: prismicM.model.select({ seed: t.title }),
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
	const model = prismicM.model.sharedSlice({
		seed: t.title,
		id: "foo",
		variations: [
			prismicM.model.sharedSliceVariation({
				seed: t.title,
				id: "bar",
				primaryFields: {
					abc: prismicM.model.keyText({ seed: t.title }),
				},
				itemsFields: {
					def: prismicM.model.select({ seed: t.title }),
				},
			}),
			prismicM.model.sharedSliceVariation({
				seed: t.title,
				id: "baz",
				primaryFields: {
					ghi: prismicM.model.keyText({ seed: t.title }),
				},
				itemsFields: {
					jkl: prismicM.model.select({ seed: t.title }),
				},
			}),
		],
	});

	const types = lib.generateTypes({ sharedSliceModels: [model] });
	const file = parseSourceFile(types);

	t.is(
		file.getTypeAliasOrThrow("FooSliceBar").getTypeNodeOrThrow().getText(),
		'prismicT.SharedSliceVariation<"bar", Simplify<FooSliceBarPrimary>, Simplify<FooSliceBarItem>>',
	);

	t.is(
		file.getTypeAliasOrThrow("FooSliceBaz").getTypeNodeOrThrow().getText(),
		'prismicT.SharedSliceVariation<"baz", Simplify<FooSliceBazPrimary>, Simplify<FooSliceBazItem>>',
	);
});

test("handles Slice variations with no fields", (t) => {
	const model = prismicM.model.sharedSlice({
		seed: t.title,
		id: "foo",
		variations: [
			prismicM.model.sharedSliceVariation({
				seed: t.title,
				id: "bar",
			}),
		],
	});

	const types = lib.generateTypes({ sharedSliceModels: [model] });
	const file = parseSourceFile(types);

	t.is(
		file.getTypeAliasOrThrow("FooSliceBar").getTypeNodeOrThrow().getText(),
		'prismicT.SharedSliceVariation<"bar", Record<string, never>, never>',
	);
});

test("handles Slice variations with no primary fields", (t) => {
	const model = prismicM.model.sharedSlice({
		seed: t.title,
		id: "foo",
		variations: [
			prismicM.model.sharedSliceVariation({
				seed: t.title,
				id: "bar",
				itemsFields: {
					def: prismicM.model.select({ seed: t.title }),
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
	const model = prismicM.model.sharedSlice({
		seed: t.title,
		id: "foo",
		variations: [
			prismicM.model.sharedSliceVariation({
				seed: t.title,
				id: "bar",
				primaryFields: {
					abc: prismicM.model.keyText({ seed: t.title }),
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
	const model = prismicM.model.sharedSlice({
		seed: t.title,
		id: "foo",
		variations: [
			prismicM.model.sharedSliceVariation({
				seed: t.title,
				id: "bar",
				primaryFields: {
					abc: prismicM.model.keyText({ seed: t.title }),
				},
				itemsFields: {
					def: prismicM.model.select({ seed: t.title }),
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
	const model = prismicM.model.sharedSlice({
		seed: t.title,
		id: "foo",
		variations: [
			prismicM.model.sharedSliceVariation({
				seed: t.title,
				id: "bar",
				primaryFields: {
					abc: prismicM.model.keyText({ seed: t.title }),
				},
				itemsFields: {
					def: prismicM.model.select({ seed: t.title }),
				},
			}),
		],
	});

	const types = lib.generateTypes({ sharedSliceModels: [model] });
	const file = parseSourceFile(types);

	const itemInterface = file.getInterfaceOrThrow("FooSliceBarItem");
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
	const model = prismicM.model.sharedSlice({
		seed: t.title,
		id: "foo",
		variations: [
			prismicM.model.sharedSliceVariation({
				seed: t.title,
				id: "bar",
				primaryFields: {
					"hyphenated-field": prismicM.model.keyText({ seed: t.title }),
				},
				itemsFields: {
					"hyphenated-field": prismicM.model.select({ seed: t.title }),
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
