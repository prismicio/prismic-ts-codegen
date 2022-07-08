import test from "ava";
import * as prismicM from "@prismicio/mock";

import { macroBasicFieldDocs } from "./__testutils__/macroBasicFieldDocs";
import { parseSourceFile } from "./__testutils__/parseSourceFile";

import * as lib from "../src";

test("correctly typed", (t) => {
	const mock = prismicM.createMockFactory({ seed: t.title });

	const model = mock.model.customType({
		id: "foo",
		fields: {
			bar: mock.model.group({
				fields: {
					baz: mock.model.keyText(),
					qux: mock.model.select(),
				},
			}),
		},
	});

	const types = lib.generateTypes({ customTypeModels: [model] });
	const file = parseSourceFile(types);
	const groupProperty = file
		.getInterfaceOrThrow("FooDocumentData")
		.getPropertyOrThrow("bar");

	t.is(
		groupProperty.getTypeNodeOrThrow().getText(),
		"prismicT.GroupField<Simplify<FooDocumentDataBarItem>>",
	);
});

test("creates an interface for a group item containing its fields", (t) => {
	const mock = prismicM.createMockFactory({ seed: t.title });

	const model = mock.model.customType({
		id: "foo",
		fields: {
			bar: mock.model.group({
				fields: {
					baz: mock.model.keyText(),
					qux: mock.model.select(),
				},
			}),
		},
	});

	const types = lib.generateTypes({ customTypeModels: [model] });
	const file = parseSourceFile(types);
	const itemInterface = file.getInterfaceOrThrow("FooDocumentDataBarItem");

	t.true(itemInterface.isExported());

	t.is(
		itemInterface.getPropertyOrThrow("baz").getTypeNodeOrThrow().getText(),
		"prismicT.KeyTextField",
	);
	t.is(
		itemInterface.getPropertyOrThrow("qux").getTypeNodeOrThrow().getText(),
		"prismicT.SelectField",
	);
});

test("correctly documented", macroBasicFieldDocs, (t) =>
	prismicM.model.boolean({ seed: t.title }),
);

test("handles hyphenated fields", (t) => {
	const mock = prismicM.createMockFactory({ seed: t.title });

	const model = mock.model.customType({
		id: "foo",
		fields: {
			bar: mock.model.group({
				fields: {
					"hyphenated-field": mock.model.keyText(),
				},
			}),
		},
	});

	const types = lib.generateTypes({ customTypeModels: [model] });
	const file = parseSourceFile(types);
	const itemInterface = file.getInterfaceOrThrow("FooDocumentDataBarItem");

	t.is(
		itemInterface
			.getPropertyOrThrow('"hyphenated-field"')
			.getTypeNodeOrThrow()
			.getText(),
		"prismicT.KeyTextField",
	);
});
