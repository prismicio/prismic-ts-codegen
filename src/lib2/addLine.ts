import { addTrailingNewLine } from "./addTrailingNewLine";

export function addLine(line: string, state: string) {
	return addTrailingNewLine(state) + line;
}
