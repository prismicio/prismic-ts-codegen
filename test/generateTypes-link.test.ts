import { it } from "vitest";

import { expectToHaveDocs } from "./__testutils__/expectToHaveDocs";
import { expectToHaveFieldType } from "./__testutils__/expectToHaveFieldType";

it("is correctly typed", (ctx) => {
	expectToHaveFieldType(ctx.mock.model.link(), "prismic.LinkField");
});

it("is correctly documented", (ctx) => {
	expectToHaveDocs(ctx.mock.model.link());
});

it("supports repeatable links", (ctx) => {
	expectToHaveFieldType(
		ctx.mock.model.link({ repeat: true }),
		"prismic.Repeatable<LinkField>",
	);
});
