import { it } from "vitest";

import * as prismic from "@prismicio/client";

import { expectToHaveDocs } from "./__testutils__/expectToHaveDocs";
import { expectToHaveFieldType } from "./__testutils__/expectToHaveFieldType";

it("is correctly typed", () => {
	expectToHaveFieldType(
		// @ts-expect-error - We are forcing an unknown field type, which raises a type error.
		{
			type: "non-existant-field-type",
			config: {
				label: "Non-existant field type",
			},
		} as prismic.CustomTypeModelField,
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
		} as prismic.CustomTypeModelField,
	);
});
