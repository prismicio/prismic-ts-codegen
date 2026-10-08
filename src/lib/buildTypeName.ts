import { pascalCase } from "change-case";

export const buildTypeName = (...parts: string[]): string => {
	// Non-ASCII characters are separators, as they were with the previous `pascal-case` package.
	let name = pascalCase(
		parts
			.filter(Boolean)
			.join(" ")
			.replace(/[^A-Z0-9]+/gi, " "),
		{ mergeAmbiguousCharacters: true },
	);

	if (/^[0-9]/.test(name) ? "_" : "") {
		name = `_${name}`;
	}

	return name;
};
