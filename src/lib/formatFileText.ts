import prettier from "prettier";

import { formatBlankLines } from "./formatBlankLines";

export const formatFileText = (input: string) => {
	return prettier.format(formatBlankLines(input), {
		parser: "typescript",
	});
};
