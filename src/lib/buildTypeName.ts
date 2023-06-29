import { pascalize } from "fast-case";

export const buildTypeName = (...parts: string[]) => {
	let name = pascalize(parts.filter(Boolean).join(" "));

	if (/^[0-9]/.test(name) ? "_" : "") {
		name = `_${name}`;
	}

	return name;
};
