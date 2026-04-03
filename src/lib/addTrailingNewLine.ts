type AddTrailingNewLineConfig = {
	force?: boolean;
};

export function addTrailingNewLine(state: string, config?: AddTrailingNewLineConfig): string {
	if ((!state || state.endsWith("\n")) && !config?.force) {
		return state;
	} else {
		return state + "\n";
	}
}
