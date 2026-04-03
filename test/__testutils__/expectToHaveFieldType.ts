import type * as prismic from "@prismicio/client";
import * as prismicM from "@prismicio/mock";
import { expect } from "vitest";

import * as lib from "../../src";
import { parseSourceFile } from "./parseSourceFile";

export function expectToHaveFieldType(
	model: prismic.CustomTypeModelField,
	expectedFieldType: string,
): void {
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
	const property = file.getInterfaceOrThrow("FooDocumentData").getPropertyOrThrow("bar");

	expect(property.getTypeNodeOrThrow().getText(), expectedFieldType).toBe(expectedFieldType);
}
