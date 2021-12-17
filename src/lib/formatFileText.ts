import { format } from "prettier";

import { formatBlankLines } from "./formatBlankLines";

export const formatFileText = (input: string) => {
	return format(formatBlankLines(input), {
		parser: "typescript",
	});
};
