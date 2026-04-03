import { addTrailingNewLine } from "./addTrailingNewLine";

export function addLine(line: string, state: string): string {
	return addTrailingNewLine(state) + line;
}
