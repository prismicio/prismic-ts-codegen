import test from "ava";
import * as prismicM from "@prismicio/mock";

import { macroBasicFieldType } from "./__testutils__/macroBasicFieldType";
import { macroBasicFieldDocs } from "./__testutils__/macroBasicFieldDocs";

test(
	"correctly typed",
	macroBasicFieldType,
	(t) => prismicM.model.image({ seed: t.title }),
	"prismicT.ImageField<never>",
);

test(
	"includes thumbnail names if defined in the model",
	macroBasicFieldType,
	(t) =>
		prismicM.model.image({
			seed: t.title,
			thumbnailNames: ["foo", "bar"],
		}),
	'prismicT.ImageField<"foo" | "bar">',
);

test("correctly documented", macroBasicFieldDocs, (t) =>
	prismicM.model.image({ seed: t.title }),
);
