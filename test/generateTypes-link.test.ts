import { it } from "vitest";

import { expectToHaveDocs } from "./__testutils__/expectToHaveDocs";
import { expectToHaveFieldType } from "./__testutils__/expectToHaveFieldType";

it("is correctly typed", (ctx) => {
	expectToHaveFieldType(
		ctx.mock.model.link(),
		"prismic.LinkField<string, string, unknown, prismic.FieldState, never>",
	);
});

it("is correctly documented", (ctx) => {
	expectToHaveDocs(ctx.mock.model.link());
});

it("supports repeatable links", (ctx) => {
	expectToHaveFieldType(
		ctx.mock.model.link({ repeat: true }),
		"prismic.Repeatable<prismic.LinkField<string, string, unknown, prismic.FieldState, never>>",
	);
});

it("supports variants", (ctx) => {
	const model = ctx.mock.model.link();
	model.config.variants = ["foo", "bar"];

	expectToHaveFieldType(
		model,
		'prismic.LinkField<string, string, unknown, prismic.FieldState, "foo" | "bar">',
	);
});

it("escapes variants", (ctx) => {
	const model = ctx.mock.model.link();
	model.config.variants = ["'foo'", '"bar"'];

	expectToHaveFieldType(
		model,
		'prismic.LinkField<string, string, unknown, prismic.FieldState, "\'foo\'" | "\\"bar\\"">',
	);
});
