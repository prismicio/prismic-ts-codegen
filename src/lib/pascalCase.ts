import {
	pascalCase as pascalCaseBase,
	pascalCaseTransformMerge,
} from "pascal-case";

export const pascalCase = (input: string): string =>
	pascalCaseBase(input, {
		transform: pascalCaseTransformMerge,
	});
