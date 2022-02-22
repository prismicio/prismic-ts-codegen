import test from "ava";
import * as prismicM from "@prismicio/mock";

import { macroBasicFieldType } from "./__testutils__/macroBasicFieldType";
import { macroBasicFieldDocs } from "./__testutils__/macroBasicFieldDocs";

test(
	"correctly typed",
	macroBasicFieldType,
	(t) =>
		prismicM.model.select({
			seed: t.title,
			options: ["foo", "bar"],
		}),
	'prismicT.SelectField<"foo" | "bar">',
);

test(
	"is always filled if a default value is defined in the model",
	macroBasicFieldType,
	(t) =>
		prismicM.model.select({
			seed: t.title,
			options: ["foo", "bar"],
			defaultValue: "bar",
		}),
	'prismicT.SelectField<"foo" | "bar", "filled">',
);

test("correctly documented", macroBasicFieldDocs, (t) =>
	prismicM.model.select({ seed: t.title }),
);
