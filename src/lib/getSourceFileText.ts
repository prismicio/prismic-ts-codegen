import * as tsm from "ts-morph";
// import prettier from "prettier";

import { BLANK_LINE_IDENTIFIER } from "../constants";

export const getSourceFileText = (sourceFile: tsm.SourceFile): string => {
	const text = sourceFile
		.print()
		.replace(new RegExp(BLANK_LINE_IDENTIFIER, "g"), "");

	return text;

	// return prettier.format(text, { parser: "typescript" });
};
