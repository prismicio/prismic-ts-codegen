import { it } from "vitest";

import { expectToHaveDocs } from "./__testutils__/expectToHaveDocs";
import { expectToHaveFieldType } from "./__testutils__/expectToHaveFieldType";

it("is correctly typed", (ctx) => {
	expectToHaveFieldType(
		ctx.mock.model.select({
			options: ["foo", "bar"],
		}),
		'prismicT.SelectField<"foo" | "bar">',
	);
});

it("is always filled if a default value is defined in the model", (ctx) => {
	expectToHaveFieldType(
		ctx.mock.model.select({
			options: ["foo", "bar"],
			defaultValue: "bar",
		}),
		'prismicT.SelectField<"foo" | "bar", "filled">',
	);
});

it("is correctly documented", (ctx) => {
	expectToHaveDocs(ctx.mock.model.select());
});
