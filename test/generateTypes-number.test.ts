import { it } from "vitest";

import { expectToHaveDocs } from "./__testutils__/expectToHaveDocs";
import { expectToHaveFieldType } from "./__testutils__/expectToHaveFieldType";

it("is correctly typed", (ctx) => {
	expectToHaveFieldType(ctx.mock.model.number(), "prismic.NumberField");
});

it("is correctly documented", (ctx) => {
	expectToHaveDocs(ctx.mock.model.number());
});
