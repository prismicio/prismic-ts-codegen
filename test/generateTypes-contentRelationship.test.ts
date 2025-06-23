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
		'prismic.ContentRelationshipField<"foo" | "bar">',
	);
});

it("is correctly typed with array of objects", (ctx) => {
	// Create a custom field configuration that simulates objects in customtypes
	const model = ctx.mock.model.contentRelationship();

	// Manually set the customtypes to objects to test the new functionality
	model.config.customtypes = [
		{ id: "foo", type: "custom" },
		{ id: "bar", type: "custom" },
	];

	expectToHaveFieldType(
		model,
		'NewContentRelationshipField<[{"id":"foo","type":"custom"},{"id":"bar","type":"custom"}]>',
	);
});

it("is correctly typed with mixed array", (ctx) => {
	// Create a custom field configuration that simulates mixed types in customtypes
	const model = ctx.mock.model.contentRelationship();

	// Manually set the customtypes to mixed types
	model.config.customtypes = ["foo", { id: "bar", type: "custom" }];

	expectToHaveFieldType(
		model,
		'prismic.ContentRelationshipField<"foo"> | NewContentRelationshipField<[{"id":"bar","type":"custom"}]>',
	);
});

it("is correctly documented", (ctx) => {
	const model = ctx.mock.model.contentRelationship();

	expectToHaveDocs(model);
});
