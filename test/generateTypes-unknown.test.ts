import test from "ava";
import * as prismicT from "@prismicio/types";

import { macroBasicFieldType } from "./__testutils__/macroBasicFieldType";
import { macroBasicFieldDocs } from "./__testutils__/macroBasicFieldDocs";

test(
	"correctly typed",
	macroBasicFieldType,
	// @ts-expect-error - We are forcing an unknown field type, which raises a type error.
	{
		type: "non-existant-field-type",
		config: {
			label: "Non-existant field type",
		},
	} as prismicT.CustomTypeModelField,
	"unknown",
);

test(
	"correctly documented",
	macroBasicFieldDocs,
	// @ts-expect-error - We are forcing an unknown field type, which raises a type error.
	{
		type: "non-existant-field-type",
		config: {
			label: "Non-existant field type",
		},
	} as prismicT.CustomTypeModelField,
);
