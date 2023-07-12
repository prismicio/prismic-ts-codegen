import { pascalCase, pascalCaseTransformMerge } from "pascal-case";

export const buildTypeName = (...parts: string[]) => {
	let name = pascalCase(parts.filter(Boolean).join(" "), {
		transform: pascalCaseTransformMerge,
	});

	if (/^[0-9]/.test(name) ? "_" : "") {
		name = `_${name}`;
	}

	return name;
};
