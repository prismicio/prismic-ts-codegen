import { pascalCase } from "./pascalCase";

export const buildTypeName = (...parts: string[]) => {
	let name = pascalCase(parts.filter(Boolean).join(" "));

	if (/^[0-9]/.test(name) ? "_" : "") {
		name = `_${name}`;
	}

	return name;
};
