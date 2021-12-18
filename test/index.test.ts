import test from "ava";
import { Project } from "ts-morph";
import * as prismicT from "@prismicio/types";
import * as prismicM from "@prismicio/mock";

import * as lib from "../src";

// TODO: Dummy test, meant to be removed when real tests come in
test("exports something", (t) => {
	const model: prismicT.CustomTypeModel = {
		id: "foo",
		label: "Foo",
		status: true,
		repeatable: true,
		json: {
			Main: {
				boolean: prismicM.model.boolean(),
				color: prismicM.model.color(),
				contentRelationship: prismicM.model.contentRelationship({
					constrainCustomTypes: true,
				}),
				date: prismicM.model.date(),
				embed: prismicM.model.embed(),
				geoPoint: prismicM.model.geoPoint(),
				image: prismicM.model.image({ thumbnailsCount: 2 }),
				integrationFields: prismicM.model.integrationFields(),
				keyText: prismicM.model.keyText(),
				link: prismicM.model.link(),
				linkToMedia: prismicM.model.linkToMedia(),
				number: prismicM.model.number(),
				richText: prismicM.model.richText(),
				select: prismicM.model.select(),
				timestamp: prismicM.model.timestamp(),
				title: prismicM.model.title(),

				group: prismicM.model.group(),
				sliceZone: prismicM.model.sliceZone({
					choices: {
						foo: prismicM.model.slice(),
						bar: prismicM.model.sharedSliceChoice(),
					},
				}),
			},
		},
	};

	const project = new Project();
	const sourceFile = project.createSourceFile("types.ts");

	lib.addTypeAliasForCustomType({
		sourceFile,
		customTypeModel: model,
	});

	t.log(lib.getSourceFileText(sourceFile));

	t.pass();
});

test.only("shared slice", (t) => {
	const model = prismicM.model.sharedSlice({ variationsCount: 2 });

	const project = new Project();
	const sourceFile = project.createSourceFile("types.ts");

	lib.addTypeAliasForSharedSlice({
		sourceFile,
		sharedSliceModel: model,
	});

	t.log(lib.getSourceFileText(sourceFile));

	t.pass();
});
