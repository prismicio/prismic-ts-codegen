import { it } from "vitest";

import { expectToHaveDocs } from "./__testutils__/expectToHaveDocs";
import { expectToHaveFieldType } from "./__testutils__/expectToHaveFieldType";

it("is correctly typed", (ctx) => {
	expectToHaveFieldType(
		ctx.mock.model.linkToMedia(),
		"prismic.LinkToMediaField",
	);
});

it("is correctly documented", (ctx) => {
	expectToHaveDocs(ctx.mock.model.linkToMedia());
});

it("supports repeatable links", (ctx) => {
	expectToHaveFieldType(
		ctx.mock.model.linkToMedia({ repeat: true }),
		"prismic.LinkToMediaField[]",
	);
});
