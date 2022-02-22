import test from "ava";
import * as prismicM from "@prismicio/mock";

import { macroBasicFieldType } from "./__testutils__/macroBasicFieldType";
import { macroBasicFieldDocs } from "./__testutils__/macroBasicFieldDocs";

test(
	"correctly typed",
	macroBasicFieldType,
	(t) => prismicM.model.embed({ seed: t.title }),
	"prismicT.EmbedField",
);

test("correctly documented", macroBasicFieldDocs, (t) =>
	prismicM.model.embed({ seed: t.title }),
);
