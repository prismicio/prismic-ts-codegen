import test from "ava";
import * as prismicM from "@prismicio/mock";
import { stripIndent } from "common-tags";

import { macroBasicFieldType } from "./__testutils__/macroBasicFieldType";
import { macroBasicFieldDocs } from "./__testutils__/macroBasicFieldDocs";
import { parseSourceFile } from "./__testutils__/parseSourceFile";

import * as lib from "../src";

test(
	"correctly typed",
	macroBasicFieldType,
	(t) => prismicM.model.embed({ seed: t.title }),
	"prismicT.EmbedField",
);

test("can be customized with provider-specific types", (t) => {
	const mock = prismicM.createMockFactory({ seed: t.title });

	const model = mock.model.customType({
		id: "foo",
		fields: {
			bar: mock.model.embed(),
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

	t.is(
		property.getTypeNodeOrThrow().getText({ trimLeadingIndentation: true }),
		stripIndent`
			prismicT.EmbedField<prismicT.AnyOEmbed & prismicT.OEmbedExtra & (({
			    provider_name: "YouTube";
			} & YouTubeType) | ({
			    provider_name: "Vimeo";
			} & VimeoType))>
		`,
	);
});

test("correctly documented", macroBasicFieldDocs, (t) =>
	prismicM.model.embed({ seed: t.title }),
);
