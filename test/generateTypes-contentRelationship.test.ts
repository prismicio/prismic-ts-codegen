import { it } from "vitest";

import { expectToHaveDocs } from "./__testutils__/expectToHaveDocs";
import { expectToHaveFieldType } from "./__testutils__/expectToHaveFieldType";

it("is correctly typed", (ctx) => {
	const model = ctx.mock.model.contentRelationship();

	expectToHaveFieldType(model, "prismic.RelationField");
});

it("is correctly typed", (ctx) => {
	const model = ctx.mock.model.contentRelationship({
		customTypeIDs: ["foo", "bar"],
	});

	expectToHaveFieldType(model, 'prismic.RelationField<"foo" | "bar">');
});

it("is correctly documented", (ctx) => {
	const model = ctx.mock.model.contentRelationship();

	expectToHaveDocs(model);
});
