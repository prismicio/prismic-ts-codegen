import { addBlankLine } from "./addBlankLine";

export function addSection(section: string, state: string): string {
	return addBlankLine(state) + section;
}
