import test from "ava";
import * as prismicM from "@prismicio/mock";

import { parseSourceFile } from "./__testutils__/parseSourceFile";

import * as lib from "../src";

test("correctly typed", (t) => {
	const model = prismicM.model.customType({
		seed: t.title,
		id: "foo",
		fields: {
			bar: prismicM.model.sliceZone({
				seed: t.title,
				choices: {
					baz: prismicM.model.slice({
						seed: t.title,
						nonRepeatFields: {
							abc: prismicM.model.keyText({ seed: t.title }),
						},
						repeatFields: {
							def: prismicM.model.select({ seed: t.title }),
						},
					}),
					qux: prismicM.model.slice({
						seed: t.title,
						nonRepeatFields: {
							ghi: prismicM.model.title({ seed: t.title }),
						},
						repeatFields: {
							jkl: prismicM.model.boolean({ seed: t.title }),
						},
					}),
				},
			}),
		},
	});

	const types = lib.generateTypes({ customTypeModels: [model] });
	const file = parseSourceFile(types);
	const sliceZoneProperty = file
		.getInterfaceOrThrow("FooDocumentData")
		.getPropertyOrThrow("bar");

	t.is(
		sliceZoneProperty.getTypeNodeOrThrow().getText(),
		"prismicT.SliceZone<FooDocumentDataBarSlice>",
	);
});

test("creates a type alias to a union of all Slice types", (t) => {
	const model = prismicM.model.customType({
		seed: t.title,
		id: "foo",
		fields: {
			bar: prismicM.model.sliceZone({
				seed: t.title,
				choices: {
					baz: prismicM.model.slice({
						seed: t.title,
						nonRepeatFields: {
							abc: prismicM.model.keyText({ seed: t.title }),
						},
						repeatFields: {
							def: prismicM.model.select({ seed: t.title }),
						},
					}),
					qux: prismicM.model.slice({
						seed: t.title,
						nonRepeatFields: {
							ghi: prismicM.model.title({ seed: t.title }),
						},
						repeatFields: {
							jkl: prismicM.model.boolean({ seed: t.title }),
						},
					}),
					quux: prismicM.model.sharedSliceChoice(),
				},
			}),
		},
	});

	const types = lib.generateTypes({ customTypeModels: [model] });
	const file = parseSourceFile(types);
	const sliceTypeAlias = file.getTypeAliasOrThrow("FooDocumentDataBarSlice");

	t.is(
		sliceTypeAlias.getTypeNodeOrThrow().getText(),
		"FooDocumentDataBarBazSlice | FooDocumentDataBarQuxSlice | QuuxSlice",
	);
});

test("creates a type alias for each Slice", (t) => {
	const model = prismicM.model.customType({
		seed: t.title,
		id: "foo",
		fields: {
			bar: prismicM.model.sliceZone({
				seed: t.title,
				choices: {
					baz: prismicM.model.slice({
						seed: t.title,
						nonRepeatFields: {
							abc: prismicM.model.keyText({ seed: t.title }),
						},
						repeatFields: {
							def: prismicM.model.select({ seed: t.title }),
						},
					}),
					qux: prismicM.model.slice({
						seed: t.title,
						nonRepeatFields: {
							ghi: prismicM.model.title({ seed: t.title }),
						},
						repeatFields: {
							jkl: prismicM.model.boolean({ seed: t.title }),
						},
					}),
				},
			}),
		},
	});

	const types = lib.generateTypes({ customTypeModels: [model] });
	const file = parseSourceFile(types);

	const bazSliceType = file.getTypeAliasOrThrow("FooDocumentDataBarBazSlice");
	const quxSliceType = file.getTypeAliasOrThrow("FooDocumentDataBarQuxSlice");

	t.true(bazSliceType.isExported());
	t.true(quxSliceType.isExported());

	t.is(
		bazSliceType.getTypeNodeOrThrow().getText(),
		'prismicT.Slice<"baz", Simplify<FooDocumentDataBarBazSlicePrimary>, Simplify<FooDocumentDataBarBazSliceItem>>',
	);

	t.is(
		quxSliceType.getTypeNodeOrThrow().getText(),
		'prismicT.Slice<"qux", Simplify<FooDocumentDataBarQuxSlicePrimary>, Simplify<FooDocumentDataBarQuxSliceItem>>',
	);
});

test("handles Slices with no fields", (t) => {
	const model = prismicM.model.customType({
		seed: t.title,
		id: "foo",
		fields: {
			bar: prismicM.model.sliceZone({
				seed: t.title,
				choices: {
					baz: prismicM.model.slice({ seed: t.title }),
				},
			}),
		},
	});

	const types = lib.generateTypes({ customTypeModels: [model] });
	const file = parseSourceFile(types);

	t.is(
		file
			.getTypeAliasOrThrow("FooDocumentDataBarBazSlice")
			.getTypeNodeOrThrow()
			.getText(),
		'prismicT.Slice<"baz", Record<string, never>, never>',
	);
});

test("handles Slices with no primary fields", (t) => {
	const model = prismicM.model.customType({
		seed: t.title,
		id: "foo",
		fields: {
			bar: prismicM.model.sliceZone({
				seed: t.title,
				choices: {
					baz: prismicM.model.slice({
						seed: t.title,
						repeatFields: {
							def: prismicM.model.select({ seed: t.title }),
						},
					}),
				},
			}),
		},
	});

	const types = lib.generateTypes({ customTypeModels: [model] });
	const file = parseSourceFile(types);

	t.is(
		file
			.getTypeAliasOrThrow("FooDocumentDataBarBazSlice")
			.getTypeNodeOrThrow()
			.getText(),
		'prismicT.Slice<"baz", Record<string, never>, Simplify<FooDocumentDataBarBazSliceItem>>',
	);
});

test("handles Slices with no item fields", (t) => {
	const model = prismicM.model.customType({
		seed: t.title,
		id: "foo",
		fields: {
			bar: prismicM.model.sliceZone({
				seed: t.title,
				choices: {
					baz: prismicM.model.slice({
						seed: t.title,
						nonRepeatFields: {
							abc: prismicM.model.keyText({ seed: t.title }),
						},
					}),
				},
			}),
		},
	});

	const types = lib.generateTypes({ customTypeModels: [model] });
	const file = parseSourceFile(types);

	t.is(
		file
			.getTypeAliasOrThrow("FooDocumentDataBarBazSlice")
			.getTypeNodeOrThrow()
			.getText(),
		'prismicT.Slice<"baz", Simplify<FooDocumentDataBarBazSlicePrimary>, never>',
	);
});

test("creates an interface for a Slice's primary fields", (t) => {
	const model = prismicM.model.customType({
		seed: t.title,
		id: "foo",
		fields: {
			bar: prismicM.model.sliceZone({
				seed: t.title,
				choices: {
					baz: prismicM.model.slice({
						seed: t.title,
						nonRepeatFields: {
							abc: prismicM.model.keyText({ seed: t.title }),
						},
						repeatFields: {
							def: prismicM.model.select({ seed: t.title }),
						},
					}),
				},
			}),
		},
	});

	const types = lib.generateTypes({ customTypeModels: [model] });
	const file = parseSourceFile(types);

	const primaryInterface = file.getInterfaceOrThrow(
		"FooDocumentDataBarBazSlicePrimary",
	);
	t.is(
		primaryInterface.getPropertyOrThrow("abc").getTypeNodeOrThrow().getText(),
		"prismicT.KeyTextField",
	);
});

test("creates an interface for a Slice's items fields", (t) => {
	const model = prismicM.model.customType({
		seed: t.title,
		id: "foo",
		fields: {
			bar: prismicM.model.sliceZone({
				seed: t.title,
				choices: {
					baz: prismicM.model.slice({
						seed: t.title,
						nonRepeatFields: {
							abc: prismicM.model.keyText({ seed: t.title }),
						},
						repeatFields: {
							def: prismicM.model.select({ seed: t.title }),
						},
					}),
				},
			}),
		},
	});

	const types = lib.generateTypes({ customTypeModels: [model] });
	const file = parseSourceFile(types);

	const itemInterface = file.getInterfaceOrThrow(
		"FooDocumentDataBarBazSliceItem",
	);

	t.true(itemInterface.isExported());

	t.is(
		itemInterface.getPropertyOrThrow("def").getTypeNodeOrThrow().getText(),
		"prismicT.SelectField",
	);
});

test("handles hyphenated fields", (t) => {
	const model = prismicM.model.customType({
		seed: t.title,
		id: "foo",
		fields: {
			bar: prismicM.model.sliceZone({
				seed: t.title,
				choices: {
					baz: prismicM.model.slice({
						seed: t.title,
						nonRepeatFields: {
							"hyphenated-field": prismicM.model.keyText({ seed: t.title }),
						},
						repeatFields: {
							"hyphenated-field": prismicM.model.select({ seed: t.title }),
						},
					}),
				},
			}),
		},
	});

	const types = lib.generateTypes({ customTypeModels: [model] });
	const file = parseSourceFile(types);

	const primaryInterface = file.getInterfaceOrThrow(
		"FooDocumentDataBarBazSlicePrimary",
	);
	const itemInterface = file.getInterfaceOrThrow(
		"FooDocumentDataBarBazSliceItem",
	);

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
