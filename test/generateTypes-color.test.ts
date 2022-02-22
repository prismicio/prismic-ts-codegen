import test from "ava";
import * as prismicM from "@prismicio/mock";

import { macroBasicFieldType } from "./__testutils__/macroBasicFieldType";
import { macroBasicFieldDocs } from "./__testutils__/macroBasicFieldDocs";

test(
	"correctly typed",
	macroBasicFieldType,
	(t) => prismicM.model.color({ seed: t.title }),
	"prismicT.ColorField",
);

test("correctly documented", macroBasicFieldDocs, (t) =>
	prismicM.model.color({ seed: t.title }),
);
