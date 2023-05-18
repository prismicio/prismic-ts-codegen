import { it } from "vitest";

import { expectToHaveDocs } from "./__testutils__/expectToHaveDocs";
import { expectToHaveFieldType } from "./__testutils__/expectToHaveFieldType";

it("is correctly typed", (ctx) => {
	expectToHaveFieldType(ctx.mock.model.image(), "prismicT.ImageField<never>");
});

it("is correctly typed", (ctx) => {
	expectToHaveFieldType(
		ctx.mock.model.image({
			thumbnailNames: ["foo", "bar"],
		}),
		'prismicT.ImageField<"foo" | "bar">',
	);
});

it("is correctly documented", (ctx) => {
	expectToHaveDocs(ctx.mock.model.image());
});
