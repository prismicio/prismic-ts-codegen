import { expect, it } from "vitest";

import { parseSourceFile } from "./__testutils__/parseSourceFile";

import * as lib from "../src";

it("correctly typed", (ctx) => {
	const model = ctx.mock.model.customType({
		id: "foo",
		fields: {
			bar: ctx.mock.model.sliceZone({
				choices: {
					baz: ctx.mock.model.slice({
						nonRepeatFields: {
							abc: ctx.mock.model.keyText(),
						},
						repeatFields: {
							def: ctx.mock.model.select(),
						},
					}),
					qux: ctx.mock.model.slice({
						nonRepeatFields: {
							ghi: ctx.mock.model.title(),
						},
						repeatFields: {
							jkl: ctx.mock.model.boolean(),
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

	expect(sliceZoneProperty.getTypeNodeOrThrow().getText()).toBe(
		"prismic.SliceZone<FooDocumentDataBarSlice>",
	);
});

it("creates a type alias to a union of all Slice types", (ctx) => {
	const model = ctx.mock.model.customType({
		id: "foo",
		fields: {
			bar: ctx.mock.model.sliceZone({
				choices: {
					baz: ctx.mock.model.slice({
						nonRepeatFields: {
							abc: ctx.mock.model.keyText(),
						},
						repeatFields: {
							def: ctx.mock.model.select(),
						},
					}),
					qux: ctx.mock.model.slice({
						nonRepeatFields: {
							ghi: ctx.mock.model.title(),
						},
						repeatFields: {
							jkl: ctx.mock.model.boolean(),
						},
					}),
					quux: ctx.mock.model.sharedSliceChoice(),
				},
			}),
		},
	});

	const types = lib.generateTypes({ customTypeModels: [model] });
	const file = parseSourceFile(types);
	const sliceTypeAlias = file.getTypeAliasOrThrow("FooDocumentDataBarSlice");

	expect(sliceTypeAlias.getTypeNodeOrThrow().getText()).toBe(
		"FooDocumentDataBarBazSlice | FooDocumentDataBarQuxSlice | QuuxSlice",
	);
});

it("creates a type alias for each Slice", (ctx) => {
	const model = ctx.mock.model.customType({
		id: "foo",
		fields: {
			bar: ctx.mock.model.sliceZone({
				choices: {
					baz: ctx.mock.model.slice({
						nonRepeatFields: {
							abc: ctx.mock.model.keyText(),
						},
						repeatFields: {
							def: ctx.mock.model.select(),
						},
					}),
					qux: ctx.mock.model.slice({
						nonRepeatFields: {
							ghi: ctx.mock.model.title(),
						},
						repeatFields: {
							jkl: ctx.mock.model.boolean(),
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

	expect(bazSliceType.isExported()).toBe(true);
	expect(quxSliceType.isExported()).toBe(true);

	expect(bazSliceType.getTypeNodeOrThrow().getText()).toBe(
		'prismic.Slice<"baz", Simplify<FooDocumentDataBarBazSlicePrimary>, Simplify<FooDocumentDataBarBazSliceItem>>',
	);

	expect(quxSliceType.getTypeNodeOrThrow().getText()).toBe(
		'prismic.Slice<"qux", Simplify<FooDocumentDataBarQuxSlicePrimary>, Simplify<FooDocumentDataBarQuxSliceItem>>',
	);
});

it("handles Slices with no fields", (ctx) => {
	const model = ctx.mock.model.customType({
		id: "foo",
		fields: {
			bar: ctx.mock.model.sliceZone({
				choices: {
					baz: ctx.mock.model.slice(),
				},
			}),
		},
	});

	const types = lib.generateTypes({ customTypeModels: [model] });
	const file = parseSourceFile(types);

	expect(
		file
			.getTypeAliasOrThrow("FooDocumentDataBarBazSlice")
			.getTypeNodeOrThrow()
			.getText(),
	).toBe('prismic.Slice<"baz", Record<string, never>, never>');
});

it("handles Slices with no primary fields", (ctx) => {
	const model = ctx.mock.model.customType({
		id: "foo",
		fields: {
			bar: ctx.mock.model.sliceZone({
				choices: {
					baz: ctx.mock.model.slice({
						repeatFields: {
							def: ctx.mock.model.select(),
						},
					}),
				},
			}),
		},
	});

	const types = lib.generateTypes({ customTypeModels: [model] });
	const file = parseSourceFile(types);

	expect(
		file
			.getTypeAliasOrThrow("FooDocumentDataBarBazSlice")
			.getTypeNodeOrThrow()
			.getText(),
	).toBe(
		'prismic.Slice<"baz", Record<string, never>, Simplify<FooDocumentDataBarBazSliceItem>>',
	);
});

it("handles Slices with no item fields", (ctx) => {
	const model = ctx.mock.model.customType({
		id: "foo",
		fields: {
			bar: ctx.mock.model.sliceZone({
				choices: {
					baz: ctx.mock.model.slice({
						nonRepeatFields: {
							abc: ctx.mock.model.keyText(),
						},
					}),
				},
			}),
		},
	});

	const types = lib.generateTypes({ customTypeModels: [model] });
	const file = parseSourceFile(types);

	expect(
		file
			.getTypeAliasOrThrow("FooDocumentDataBarBazSlice")
			.getTypeNodeOrThrow()
			.getText(),
	).toBe(
		'prismic.Slice<"baz", Simplify<FooDocumentDataBarBazSlicePrimary>, never>',
	);
});

it("creates an interface for a Slice's primary fields", (ctx) => {
	const model = ctx.mock.model.customType({
		id: "foo",
		fields: {
			bar: ctx.mock.model.sliceZone({
				choices: {
					baz: ctx.mock.model.slice({
						nonRepeatFields: {
							abc: ctx.mock.model.keyText(),
						},
						repeatFields: {
							def: ctx.mock.model.select(),
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
	expect(
		primaryInterface.getPropertyOrThrow("abc").getTypeNodeOrThrow().getText(),
	).toBe("prismic.KeyTextField");
});

it("creates an interface for a Slice's items fields", (ctx) => {
	const model = ctx.mock.model.customType({
		id: "foo",
		fields: {
			bar: ctx.mock.model.sliceZone({
				choices: {
					baz: ctx.mock.model.slice({
						nonRepeatFields: {
							abc: ctx.mock.model.keyText(),
						},
						repeatFields: {
							def: ctx.mock.model.select(),
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

	expect(itemInterface.isExported()).toBe(true);

	expect(
		itemInterface.getPropertyOrThrow("def").getTypeNodeOrThrow().getText(),
	).toBe("prismic.SelectField");
});

it("handles hyphenated fields", (ctx) => {
	const model = ctx.mock.model.customType({
		id: "foo",
		fields: {
			bar: ctx.mock.model.sliceZone({
				choices: {
					baz: ctx.mock.model.slice({
						nonRepeatFields: {
							"hyphenated-field": ctx.mock.model.keyText(),
						},
						repeatFields: {
							"hyphenated-field": ctx.mock.model.select(),
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
	const model = ctx.mock.model.customType({
		id: "123",
		fields: {
			456: ctx.mock.model.sliceZone({
				choices: {
					789: ctx.mock.model.slice({
						nonRepeatFields: {
							foo: ctx.mock.model.keyText(),
						},
						repeatFields: {
							bar: ctx.mock.model.select(),
						},
					}),
				},
			}),
		},
	});

	const types = lib.generateTypes({ customTypeModels: [model] });
	const file = parseSourceFile(types);

	const sliceZoneProperty = file
		.getInterfaceOrThrow("_123DocumentData")
		.getPropertyOrThrow('"456"');
	const sliceTypeAlias = file.getTypeAliasOrThrow("_123DocumentData456Slice");
	const sliceType = file.getTypeAliasOrThrow("_123DocumentData456789Slice");

	expect(sliceZoneProperty.getTypeNodeOrThrow().getText()).toBe(
		"prismic.SliceZone<_123DocumentData456Slice>",
	);

	expect(sliceTypeAlias.getTypeNodeOrThrow().getText()).toBe(
		"_123DocumentData456789Slice",
	);

	expect(sliceType.isExported()).toBe(true);

	expect(
		sliceType.getTypeNodeOrThrow().getText(),
		'prismic.Slice<"789", Simplify<_123DocumentData456789SlicePrimary>, Simplify<_123DocumentData456789SliceItem>>',
	);
});
