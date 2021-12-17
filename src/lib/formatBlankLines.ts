import { BLANK_LINE_IDENTIFIER } from "../constants";

export const formatBlankLines = (input: string): string => {
	return input.replace(new RegExp(BLANK_LINE_IDENTIFIER, "g"), "");
};
