import * as tsm from "ts-morph";

import { formatFileText } from "./formatFileText";

export const getSourceFileText = (sourceFile: tsm.SourceFile): string => {
	const text = sourceFile.print();

	return formatFileText(text);
};
