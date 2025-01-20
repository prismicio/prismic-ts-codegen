import { it } from "vitest";

import { expectToHaveDocs } from "./__testutils__/expectToHaveDocs";
import { expectToHaveFieldType } from "./__testutils__/expectToHaveFieldType";

it("is correctly typed", (ctx) => {
	expectToHaveFieldType(
		ctx.mock.model.linkToMedia(),
		"prismic.LinkToMediaField<prismic.FieldState, never>",
	);
});

it("is correctly documented", (ctx) => {
	expectToHaveDocs(ctx.mock.model.linkToMedia());
});

it("supports variants", (ctx) => {
	const model = ctx.mock.model.linkToMedia();
	model.config.variants = ["foo", "bar"];

	expectToHaveFieldType(
		model,
		'prismic.LinkToMediaField<prismic.FieldState, "foo" | "bar">',
	);
});

it("escapes variants", (ctx) => {
	const model = ctx.mock.model.linkToMedia();
	model.config.variants = ["'foo'", '"bar"'];

	expectToHaveFieldType(
		model,
		'prismic.LinkToMediaField<prismic.FieldState, "\'foo\'" | "\\"bar\\"">',
	);
});
