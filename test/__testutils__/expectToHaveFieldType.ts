import { expect } from "vitest";

import * as prismic from "@prismicio/client";
import * as prismicM from "@prismicio/mock";

import { parseSourceFile } from "./parseSourceFile";

import * as lib from "../../src";

export function expectToHaveFieldType(
	model: prismic.CustomTypeModelField,
	expectedFieldType: string,
) {
	const res = lib.generateTypes({
		customTypeModels: [
			prismicM.model.customType({
				seed: "expectToHaveFieldType",
				id: "foo",
				fields: {
					bar: model,
				},
			}),
		],
	});

	const file = parseSourceFile(res);
	const property = file
		.getInterfaceOrThrow("FooDocumentData")
		.getPropertyOrThrow("bar");

	expect(property.getTypeNodeOrThrow().getText(), expectedFieldType).toBe(
		expectedFieldType,
	);
}
