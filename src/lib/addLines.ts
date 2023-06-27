import { addTrailingNewLine } from "./addTrailingNewLine";

export function addLines(lines: string[], state: string) {
	return addTrailingNewLine(state) + lines.join("\n");
}
