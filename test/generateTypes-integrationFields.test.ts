import test from "ava";
import * as prismicM from "@prismicio/mock";

import { macroBasicFieldType } from "./__testutils__/macroBasicFieldType";
import { macroBasicFieldDocs } from "./__testutils__/macroBasicFieldDocs";
import { parseSourceFile } from "./__testutils__/parseSourceFile";

import * as lib from "../src";

test(
	"correctly typed",
	macroBasicFieldType,
	(t) => prismicM.model.integrationFields({ seed: t.title }),
	"prismicT.IntegrationFields",
);

test("can be customized with catalog-specific types", (t) => {
	const mock = prismicM.createMockFactory({ seed: t.title });

	const model = mock.model.customType({
		id: "foo",
		fields: {
			bar: mock.model.integrationFields({ catalog: "abc" }),
			baz: mock.model.integrationFields({ catalog: "def" }),
		},
	});

	const types = lib.generateTypes({
		customTypeModels: [model],
		fieldConfigs: {
			integrationFields: {
				catalogTypes: {
					abc: "AbcType",
					def: "DefType",
				},
			},
		},
	});
	const file = parseSourceFile(types);
	const dataInterface = file.getInterfaceOrThrow("FooDocumentData");

	t.is(
		dataInterface.getPropertyOrThrow("bar").getTypeNodeOrThrow().getText(),
		"prismicT.IntegrationFields<AbcType>",
	);
	t.is(
		dataInterface.getPropertyOrThrow("baz").getTypeNodeOrThrow().getText(),
		"prismicT.IntegrationFields<DefType>",
	);
});

test("correctly documented", macroBasicFieldDocs, (t) =>
	prismicM.model.integrationFields({ seed: t.title }),
);
