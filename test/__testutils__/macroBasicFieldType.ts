import { ExecutionContext } from "ava";
import * as prismicM from "@prismicio/mock";
import * as prismicT from "@prismicio/types";

import { parseSourceFile } from "./parseSourceFile";

import * as lib from "../../src";

export const macroBasicFieldType = <
	FieldModel extends prismicT.CustomTypeModelField,
>(
	t: ExecutionContext,
	fieldModel: FieldModel | ((t: ExecutionContext) => FieldModel),
	expectedFieldType: string,
): void => {
	const res = lib.generateTypes({
		customTypeModels: [
			prismicM.model.customType({
				seed: t.title,
				id: "foo",
				fields: {
					bar: typeof fieldModel === "function" ? fieldModel(t) : fieldModel,
				},
			}),
		],
	});

	const file = parseSourceFile(res);
	const property = file
		.getInterfaceOrThrow("FooDocumentData")
		.getPropertyOrThrow("bar");

	t.is(property.getTypeNodeOrThrow().getText(), expectedFieldType);
};
