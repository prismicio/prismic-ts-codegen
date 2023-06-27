import { addTrailingNewLine } from "./addTrailingNewLine";

type AddBlankLineConfig = {
	force?: boolean;
};

export function addBlankLine(state: string, config?: AddBlankLineConfig) {
	if ((!state || state.endsWith("\n\n")) && !config?.force) {
		return state;
	} else {
		return addTrailingNewLine(state) + "\n";
	}
}
