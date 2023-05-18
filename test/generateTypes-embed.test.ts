import { expect, it } from "vitest";

import { stripIndent } from "common-tags";

import { expectToHaveDocs } from "./__testutils__/expectToHaveDocs";
import { expectToHaveFieldType } from "./__testutils__/expectToHaveFieldType";
import { parseSourceFile } from "./__testutils__/parseSourceFile";

import * as lib from "../src";

it("is correctly typed", (ctx) => {
	expectToHaveFieldType(ctx.mock.model.embed(), "prismicT.EmbedField");
});

it("can be customized with provider-specific types", (ctx) => {
	const model = ctx.mock.model.customType({
		id: "foo",
		fields: {
			bar: ctx.mock.model.embed(),
		},
	});

	const res = lib.generateTypes({
		customTypeModels: [model],
		fieldConfigs: {
			embed: {
				providerTypes: {
					YouTube: "YouTubeType",
					Vimeo: "VimeoType",
				},
			},
		},
	});
	const file = parseSourceFile(res);
	const property = file
		.getInterfaceOrThrow("FooDocumentData")
		.getPropertyOrThrow("bar");

	expect(
		property.getTypeNodeOrThrow().getText({ trimLeadingIndentation: true }),
	).toBe(
		stripIndent`
			prismicT.EmbedField<prismicT.AnyOEmbed & prismicT.OEmbedExtra & (({
			    provider_name: "YouTube";
			} & YouTubeType) | ({
			    provider_name: "Vimeo";
			} & VimeoType))>
		`,
	);
});

it("is correctly documented", (ctx) => {
	expectToHaveDocs(ctx.mock.model.embed());
});
