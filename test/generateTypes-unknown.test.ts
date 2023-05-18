import { it } from "vitest";

import { expectToHaveDocs } from "./__testutils__/expectToHaveDocs";
import { expectToHaveFieldType } from "./__testutils__/expectToHaveFieldType";

import * as prismicT from "@prismicio/types";

it("is correctly typed", () => {
	expectToHaveFieldType(
		// @ts-expect-error - We are forcing an unknown field type, which raises a type error.
		{
			type: "non-existant-field-type",
			config: {
				label: "Non-existant field type",
			},
		} as prismicT.CustomTypeModelField,
		"unknown",
	);
});

it("is correctly documented", () => {
	expectToHaveDocs(
		// @ts-expect-error - We are forcing an unknown field type, which raises a type error.
		{
			type: "non-existant-field-type",
			config: {
				label: "Non-existant field type",
			},
		} as prismicT.CustomTypeModelField,
	);
});
