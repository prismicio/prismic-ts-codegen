import { expect, it } from "vitest";

import { expectToHaveDocs } from "./__testutils__/expectToHaveDocs";
import { expectToHaveFieldType } from "./__testutils__/expectToHaveFieldType";
import { parseSourceFile } from "./__testutils__/parseSourceFile";

import * as lib from "../src";

it("is correctly typed", (ctx) => {
	expectToHaveFieldType(
		ctx.mock.model.integrationFields(),
		"prismic.IntegrationField",
	);
});

it("can be customized with catalog-specific types", (ctx) => {
	const model = ctx.mock.model.customType({
		id: "foo",
		fields: {
			bar: ctx.mock.model.integrationFields({ catalog: "abc" }),
			baz: ctx.mock.model.integrationFields({ catalog: "def" }),
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

	expect(
		dataInterface.getPropertyOrThrow("bar").getTypeNodeOrThrow().getText(),
	).toBe("prismic.IntegrationField<AbcType>");
	expect(
		dataInterface.getPropertyOrThrow("baz").getTypeNodeOrThrow().getText(),
	).toBe("prismic.IntegrationField<DefType>");
});

it("is correctly documented", (ctx) => {
	expectToHaveDocs(ctx.mock.model.integrationFields());
});
