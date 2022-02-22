import test from "ava";
import * as prismicM from "@prismicio/mock";

import { macroBasicFieldType } from "./__testutils__/macroBasicFieldType";
import { macroBasicFieldDocs } from "./__testutils__/macroBasicFieldDocs";

test(
	"correctly typed",
	macroBasicFieldType,
	(t) => prismicM.model.contentRelationship({ seed: t.title }),
	"prismicT.RelationField",
);

test(
	"scopes document types if defined in the model",
	macroBasicFieldType,
	(t) =>
		prismicM.model.contentRelationship({
			seed: t.title,
			customTypeIDs: ["foo", "bar"],
		}),
	'prismicT.RelationField<"foo" | "bar">',
);

test("correctly documented", macroBasicFieldDocs, (t) =>
	prismicM.model.contentRelationship({ seed: t.title }),
);
