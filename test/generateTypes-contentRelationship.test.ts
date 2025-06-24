import { it } from "vitest";

import { expectToHaveDocs } from "./__testutils__/expectToHaveDocs";
import { expectToHaveFieldType } from "./__testutils__/expectToHaveFieldType";

it("is correctly typed", (ctx) => {
	const model = ctx.mock.model.contentRelationship();

	expectToHaveFieldType(model, "prismic.ContentRelationshipField");
});

it("is correctly typed with array of strings", (ctx) => {
	const model = ctx.mock.model.contentRelationship({
		customTypeIDs: ["foo", "bar"],
	});

	expectToHaveFieldType(
		model,
		'prismic.ContentRelationshipField<"foo"> | prismic.ContentRelationshipField<"bar">',
	);
});

it("is correctly typed with array of objects", (ctx) => {
	// Create a custom field configuration that simulates objects in customtypes
	const model = ctx.mock.model.contentRelationship();

	// Manually set the customtypes to objects to test the new functionality

	// Disabled eslint because prismic-mock is outdated
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	(model.config as any).customtypes = [
		{ id: "foo", type: "custom" },
		{ id: "bar", type: "custom" },
	];

	expectToHaveFieldType(
		model,
		'ContentRelationshipFieldWithData<[{"id":"foo","type":"custom"}]> | ContentRelationshipFieldWithData<[{"id":"bar","type":"custom"}]>',
	);
});

it("is correctly typed with mixed array", (ctx) => {
	// Create a custom field configuration that simulates mixed types in customtypes
	const model = ctx.mock.model.contentRelationship();

	// Manually set the customtypes to mixed types

	// Disabled eslint because prismic-mock is outdated
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	(model.config as any).customtypes = ["foo", { id: "bar", type: "custom" }];

	expectToHaveFieldType(
		model,
		'prismic.ContentRelationshipField<"foo"> | ContentRelationshipFieldWithData<[{"id":"bar","type":"custom"}]>',
	);
});

it("is correctly documented", (ctx) => {
	const model = ctx.mock.model.contentRelationship();

	expectToHaveDocs(model);
});
