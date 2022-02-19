import test from "ava";
import * as prismicM from "@prismicio/mock";

import { parseSourceFile } from "./__testutils__/parseSourceFile";

import * as lib from "../src";

test("typed with prismicT.KeyTextField", (t) => {
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
	const property = file
		.getInterfaceOrThrow("FooDocumentData")
		.getPropertyOrThrow("bar");

	t.is(property.getTypeNodeOrThrow().getText(), "prismicT.KeyTextField");
});

test.todo("includes correct documentation");
