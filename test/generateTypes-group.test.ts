import test from "ava";
import * as prismicM from "@prismicio/mock";

import { macroBasicFieldDocs } from "./__testutils__/macroBasicFieldDocs";
import { parseSourceFile } from "./__testutils__/parseSourceFile";

import * as lib from "../src";

test("correctly typed", (t) => {
	const model = prismicM.model.customType({
		seed: t.title,
		id: "foo",
		fields: {
			bar: prismicM.model.group({
				seed: t.title,
				fields: {
					baz: prismicM.model.keyText({ seed: t.title }),
					qux: prismicM.model.select({ seed: t.title }),
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
	const model = prismicM.model.customType({
		seed: t.title,
		id: "foo",
		fields: {
			bar: prismicM.model.group({
				seed: t.title,
				fields: {
					baz: prismicM.model.keyText({ seed: t.title }),
					qux: prismicM.model.select({ seed: t.title }),
				},
			}),
		},
	});

	const types = lib.generateTypes({ customTypeModels: [model] });
	const file = parseSourceFile(types);
	const itemInterface = file.getInterfaceOrThrow("FooDocumentDataBarItem");

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
