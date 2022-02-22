import { ExecutionContext } from "ava";
import * as prismicT from "@prismicio/types";

export const macroBasicFieldDocs = (
	t: ExecutionContext,
	fieldModel:
		| prismicT.CustomTypeModelField
		| ((t: ExecutionContext) => prismicT.CustomTypeModelField),
): void => {
	// Declaring to supress unused warning
	fieldModel;

	t.pass();
};
